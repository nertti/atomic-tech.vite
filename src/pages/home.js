import '../js/main.js'
import '../css/home.css'
import '../css/home-sections.css'
import '../css/home-cases.css'
import '../css/home-studio.css'
import '../css/home-ending.css'
import '../css/home-v2.css'
import '../css/home-navigation.css'
import { initHomeCases } from '../js/components/home-cases.js'
import { initHomeCatalog } from '../js/components/home-catalog.js'
import { initHomeTeam } from '../js/components/home-team.js'
import { initHomeEnding } from '../js/components/home-ending.js'
import { initHomeReviews } from '../js/components/home-reviews.js'
import { initHomeHero } from '../js/components/home-hero.js'
import { initHomeNavigation } from '../js/components/home-navigation.js'
import { initHomeWhy } from '../js/components/home-why.js'

initHomeCases()
initHomeCatalog()
initHomeTeam()
initHomeEnding()
initHomeReviews()
initHomeHero()
initHomeWhy()

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

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
const mobile = window.matchMedia('(max-width: 900px)')
const { closeNavigation } = initHomeNavigation(header, mobile)

document.querySelector('.home-hero__cta').addEventListener('click', async event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    closeNavigation()
    await document.fonts.ready

    const panel = document.querySelector('.home-contact__background')
    const form = panel.querySelector('.home-contact__form')
    let top = window.scrollY + panel.closest('.home-contact').getBoundingClientRect().top
    if (!mobile.matches) {
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight
        const headerBottom = header.getBoundingClientRect().bottom
        const availableHeight = viewportHeight - headerBottom
        const panelBox = panel.getBoundingClientRect()
        const targetBox = panelBox.height <= availableHeight ? panelBox : form.getBoundingClientRect()
        const freeSpace = availableHeight - targetBox.height
        const offset = headerBottom + (freeSpace >= 0 ? freeSpace / 2 : 8)
        top = window.scrollY + targetBox.top - offset
    }

    if (window.location.hash !== '#contact') window.history.pushState(null, '', '#contact')
    form.focus({ preventScroll: true })
    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? 'instant' : 'smooth' })
})
