import '../js/main.js'
import '../css/home.css'
import '../css/home-sections.css'
import '../css/home-cases.css'
import '../css/home-studio.css'
import '../css/home-ending.css'
import '../css/home-v2.css'
import { initHomeCases } from '../js/components/home-cases.js'
import { initHomeCatalog } from '../js/components/home-catalog.js'
import { initHomeTeam } from '../js/components/home-team.js'
import { initHomeEnding } from '../js/components/home-ending.js'

initHomeCases()
initHomeCatalog()
initHomeTeam()
initHomeEnding()

document.querySelectorAll('[data-scroll-progress]').forEach((progress) => {
    const rail = document.querySelector(progress.dataset.scrollProgress)
    const update = () => {
        const max = rail.scrollWidth - rail.clientWidth
        progress.hidden = max <= 1
        const width = Math.max(12, 56 * rail.clientWidth / rail.scrollWidth)
        progress.style.setProperty('--thumb-width', `${width}px`)
        progress.style.setProperty('--thumb-offset', `${max > 0 ? (56 - width) * rail.scrollLeft / max : 0}px`)
    }
    rail.addEventListener('scroll', update, { passive: true })
    new ResizeObserver(update).observe(rail)
    update()
})

const header = document.querySelector('.home-header')
const toggle = header.querySelector('.home-header__toggle')
const navigation = header.querySelector('.home-header__nav')
const services = header.querySelector('.home-services')
const mobile = window.matchMedia('(max-width: 900px)')

function closeNavigation(restoreFocus = false) {
    const wasOpen = header.classList.contains('is-menu-open') || services.open
    header.classList.remove('is-menu-open')
    services.open = false
    toggle.setAttribute('aria-expanded', 'false')
    toggle.setAttribute('aria-label', 'Открыть меню')
    if (restoreFocus && wasOpen) {
        const trigger = mobile.matches ? toggle : services.querySelector('summary')
        trigger.focus()
    }
}

toggle.addEventListener('click', () => {
    const open = header.classList.toggle('is-menu-open')
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню')
})

navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation()
})

document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) closeNavigation()
})

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNavigation(true)
})

header.addEventListener('focusout', (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) closeNavigation()
})

mobile.addEventListener('change', () => closeNavigation())
