import '../js/main.js'
import '../css/home.css'
import '../css/home-cases.css'
import '../css/home-ending.css'
import '../css/home-v2.css'
import '../css/home-navigation.css'
import '../css/service.css'
import { initHomeNavigation } from '../js/components/home-navigation.js'
import { initHomeCases } from '../js/components/home-cases.js'
import { initHomeEnding } from '../js/components/home-ending.js'
import { enableRailDrag } from '../js/components/horizontal-rail.js'
import { initServiceProcess } from '../js/components/service-process.js'

const header = document.querySelector('.home-header')
const mobile = window.matchMedia('(max-width: 900px)')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const { closeNavigation } = initHomeNavigation(header, mobile)
const cycle = document.querySelector('.service-cycle__cards')
const progress = document.querySelector('[data-scroll-progress=".service-cycle__cards"]')

initHomeCases()
initHomeEnding()
initServiceProcess()
enableRailDrag(cycle)

function updateProgress() {
    const max = cycle.scrollWidth - cycle.clientWidth
    progress.hidden = max <= 1
    const width = Math.max(12, 56 * cycle.clientWidth / cycle.scrollWidth)
    progress.style.setProperty('--thumb-width', `${width}px`)
    progress.style.setProperty('--thumb-offset', `${max > 0 ? (56 - width) * cycle.scrollLeft / max : 0}px`)
}
cycle.addEventListener('scroll', updateProgress, { passive: true })
new ResizeObserver(updateProgress).observe(cycle)
updateProgress()

document.querySelector('.service-hero__cta').addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    closeNavigation()
    const form = document.querySelector('.home-contact__form')
    const panel = document.querySelector('.home-contact__background')
    const top = panel.getBoundingClientRect().top + window.scrollY - header.getBoundingClientRect().bottom - 16
    if (window.location.hash !== '#contact') window.history.pushState(null, '', '#contact')
    form.focus({ preventScroll: true })
    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? 'instant' : 'smooth' })
})
