import '../css/slick.css'
import '../css/base.css'
import '../css/studio.css'
import { initHomeCases } from './components/home-cases.js'
import { initHomeEnding } from './components/home-ending.js'
import { initHomeNavigation } from './components/home-navigation.js'
import { initScrollProgress } from './components/scroll-progress.js'

export function initStudioPage({ contactLink, getContactTop, waitForFonts = false }) {
    const header = document.querySelector('.home-header')
    const mobile = window.matchMedia('(max-width: 900px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const { closeNavigation } = initHomeNavigation(header, mobile)

    initHomeCases()
    initHomeEnding()
    initScrollProgress()

    document.querySelector(contactLink).addEventListener('click', async event => {
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        closeNavigation()
        if (waitForFonts) await document.fonts.ready

        const panel = document.querySelector('.home-contact__background')
        const form = panel.querySelector('.home-contact__form')
        const top = getContactTop({ header, mobile: mobile.matches, panel, form })
        if (window.location.hash !== '#contact') window.history.pushState(null, '', '#contact')
        form.focus({ preventScroll: true })
        window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? 'instant' : 'smooth' })
    })
}
