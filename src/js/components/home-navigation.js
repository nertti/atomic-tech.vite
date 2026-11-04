export function initHomeNavigation(header, mobile) {
    const toggle = header.querySelector('.home-header__toggle')
    const desktopNavigation = header.querySelector('.home-header__nav')
    const services = header.querySelector('.home-services')
    const menu = header.querySelector('.home-mobile-menu')
    const backdrop = header.querySelector('.home-header__backdrop')
    const servicesToggle = menu.querySelector('[data-mobile-services-toggle]')
    const categories = menu.querySelector('[data-mobile-categories]')
    const categoryButtons = [...menu.querySelectorAll('[data-mobile-service]')]
    const panels = [...menu.querySelectorAll('[data-mobile-service-panel]')]
    const originalLabel = header.getAttribute('aria-label')
    const inertElements = new Map()

    const isOpen = () => header.classList.contains('is-menu-open')

    function collapseServices() {
        if (categories.contains(document.activeElement)) servicesToggle.focus({ preventScroll: true })
        categories.hidden = true
        panels.forEach(panel => { panel.hidden = true })
        categoryButtons.forEach(button => button.setAttribute('aria-expanded', 'false'))
        servicesToggle.setAttribute('aria-expanded', 'false')
    }

    function openNavigation() {
        services.open = false
        header.classList.add('is-menu-open')
        header.setAttribute('role', 'dialog')
        header.setAttribute('aria-modal', 'true')
        header.setAttribute('aria-label', 'Меню сайта')
        menu.hidden = false
        backdrop.hidden = false
        toggle.setAttribute('aria-expanded', 'true')
        toggle.setAttribute('aria-label', 'Закрыть меню')
        toggle.title = 'Закрыть меню'
        document.documentElement.classList.add('home-navigation-open')
        for (const element of header.parentElement.children) {
            if (element === header) continue
            inertElements.set(element, element.inert)
            element.inert = true
        }
        collapseServices()
        menu.scrollTop = 0
        servicesToggle.focus({ preventScroll: true })
    }

    function closeNavigation(restoreFocus = false) {
        const wasOpen = isOpen() || services.open
        header.classList.remove('is-menu-open')
        header.removeAttribute('role')
        header.removeAttribute('aria-modal')
        header.setAttribute('aria-label', originalLabel)
        services.open = false
        collapseServices()
        menu.hidden = true
        backdrop.hidden = true
        toggle.setAttribute('aria-expanded', 'false')
        toggle.setAttribute('aria-label', 'Открыть меню')
        toggle.title = 'Меню'
        document.documentElement.classList.remove('home-navigation-open')
        for (const [element, inert] of inertElements) element.inert = inert
        inertElements.clear()
        if (restoreFocus && wasOpen) {
            const trigger = mobile.matches ? toggle : services.querySelector('summary')
            trigger.focus({ preventScroll: true })
        }
    }

    toggle.addEventListener('click', () => {
        if (!mobile.matches) return
        if (!isOpen()) openNavigation()
        else closeNavigation(true)
    })

    menu.addEventListener('click', event => {
        if (event.target.closest('[data-mobile-services-toggle]')) {
            if (categories.hidden) {
                categories.hidden = false
                servicesToggle.setAttribute('aria-expanded', 'true')
            } else collapseServices()
            return
        }
        const category = event.target.closest('[data-mobile-service]')
        if (category) {
            const panel = panels.find(panel => panel.id === category.getAttribute('aria-controls'))
            if (!panel) return
            const expand = panel.hidden
            panels.forEach(item => { item.hidden = item !== panel || !expand })
            categoryButtons.forEach(button => button.setAttribute('aria-expanded', String(button === category && expand)))
        } else if (event.target.closest('a[href]')) {
            const link = event.target.closest('a[href]')
            if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || (link.target && link.target !== '_self')) return
            closeNavigation()
            requestAnimationFrame(() => {
                const target = link.hash === '#contact'
                    ? document.querySelector('.home-contact__form')
                    : document.getElementById(link.hash.slice(1))
                if (!target) return
                const hadTabIndex = target.hasAttribute('tabindex')
                if (!hadTabIndex) {
                    target.setAttribute('tabindex', '-1')
                    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
                }
                target.focus({ preventScroll: true })
            })
        }
    })

    backdrop.addEventListener('click', () => closeNavigation(true))
    desktopNavigation.addEventListener('click', event => {
        if (event.target.closest('a')) closeNavigation()
    })
    document.addEventListener('click', event => {
        if (!header.contains(event.target)) closeNavigation()
    })
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeNavigation(true)
            return
        }
        if (event.key !== 'Tab' || !isOpen() || !mobile.matches) return
        const focusable = [...header.querySelectorAll('a[href], button:not(:disabled), summary, [tabindex="0"]')]
            .filter(element => element.tabIndex >= 0 && element.getClientRects().length)
        const first = focusable[0]
        const last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
        }
    })
    header.addEventListener('focusout', event => {
        if (event.relatedTarget && !header.contains(event.relatedTarget)) closeNavigation()
    })
    mobile.addEventListener('change', () => closeNavigation())

    return { closeNavigation }
}
