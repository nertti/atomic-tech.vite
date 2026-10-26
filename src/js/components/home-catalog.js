import { enableRailDrag } from './horizontal-rail.js'

function pinCatalog(catalog, rail, reducedMotion, mobile) {
    const track = catalog.querySelector('.home-catalog__scroll')
    const viewport = catalog.querySelector('.home-catalog__viewport')
    const header = document.querySelector('.home-header')
    let pin = null
    let expectedLeft = rail.scrollLeft
    let frame = 0

    const clamp = (value, max) => Math.max(0, Math.min(max, value))
    const startPosition = () => window.scrollY + track.getBoundingClientRect().top - pin.top

    function syncFromPage() {
        frame = 0
        if (!pin) return
        expectedLeft = clamp(window.scrollY - startPosition(), pin.distance)
        rail.scrollLeft = expectedLeft
    }

    function measure() {
        const distance = Math.max(0, rail.scrollWidth - rail.clientWidth)
        const top = (header?.getBoundingClientRect().bottom ?? 0) + 16
        const height = viewport.offsetHeight
        // A tall card must remain fully readable on short and landscape screens.
        pin = !mobile.matches && distance > 1 && height <= window.innerHeight - top - 16
            ? { top, distance }
            : null
        track.classList.toggle('is-pinned', Boolean(pin))
        if (!pin) {
            track.style.removeProperty('--catalog-scroll-height')
            track.style.removeProperty('--catalog-scroll-top')
            return
        }
        track.style.setProperty('--catalog-scroll-height', `${height + distance}px`)
        track.style.setProperty('--catalog-scroll-top', `${top}px`)
        syncFromPage()
    }

    window.addEventListener('scroll', () => {
        if (!frame) frame = requestAnimationFrame(syncFromPage)
    }, { passive: true })

    rail.addEventListener('scroll', () => {
        if (!pin || Math.abs(rail.scrollLeft - expectedLeft) <= 1) return
        const start = startPosition()
        if (window.scrollY < start - 1 || window.scrollY > start + pin.distance + 1) return
        // Keep touch swipes and mouse dragging in sync with the vertical progress.
        expectedLeft = rail.scrollLeft
        window.scrollTo({ top: start + expectedLeft, behavior: 'instant' })
    }, { passive: true })

    const resize = new ResizeObserver(measure)
    resize.observe(viewport)
    resize.observe(rail)
    if (header) resize.observe(header)
    window.addEventListener('resize', measure)
    mobile.addEventListener('change', measure)
    window.addEventListener('load', measure, { once: true })
    document.fonts.ready.then(measure)
    measure()

    return left => {
        if (!pin) return false
        window.scrollTo({
            top: startPosition() + clamp(left, pin.distance),
            behavior: reducedMotion.matches ? 'instant' : 'smooth',
        })
        return true
    }
}

export function initHomeCatalog() {
    const catalog = document.querySelector('.home-catalog')
    if (!catalog) return

    const rail = catalog.querySelector('.home-catalog__cards')
    const cards = [...rail.querySelectorAll('.home-service-card')]
    const controls = catalog.querySelector('.home-catalog__controls')
    const previous = catalog.querySelector('.home-catalog__previous')
    const next = catalog.querySelector('.home-catalog__next')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = window.matchMedia('(max-width: 900px)')
    const scrollPinned = pinCatalog(catalog, rail, reducedMotion, mobile)

    function updateControls() {
        const max = rail.scrollWidth - rail.clientWidth
        const overflow = !mobile.matches && max > 1
        if (!overflow && controls.contains(document.activeElement)) rail.focus({ preventScroll: true })
        controls.hidden = !overflow
        if (mobile.matches) rail.removeAttribute('aria-roledescription')
        else rail.setAttribute('aria-roledescription', 'карусель')
        previous.disabled = rail.scrollLeft <= 1
        next.disabled = rail.scrollLeft >= max - 1
    }

    function scrollTo(left) {
        if (!scrollPinned(left)) rail.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' })
    }

    function move(direction) {
        const max = rail.scrollWidth - rail.clientWidth
        const positions = cards.map(card => Math.min(max, card.offsetLeft - cards[0].offsetLeft))
        const target = direction > 0
            ? positions.find(left => left > rail.scrollLeft + 1)
            : positions.reverse().find(left => left < rail.scrollLeft - 1)
        if (target !== undefined) scrollTo(target)
    }

    previous.addEventListener('click', () => move(-1))
    next.addEventListener('click', () => move(1))
    rail.addEventListener('keydown', event => {
        if (mobile.matches || event.target !== rail) return
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
        event.preventDefault()
        if (event.key === 'Home') scrollTo(0)
        else if (event.key === 'End') scrollTo(rail.scrollWidth - rail.clientWidth)
        else move(event.key === 'ArrowRight' ? 1 : -1)
    })

    enableRailDrag(rail)
    rail.addEventListener('scroll', updateControls, { passive: true })
    new ResizeObserver(updateControls).observe(rail)
    mobile.addEventListener('change', updateControls)
    updateControls()
}
