import { initStudioPage } from '../js/studio.js'
import '../css/service.css'
import { enableRailDrag } from '../js/components/horizontal-rail.js'
import { initServiceProcess } from '../js/components/service-process.js'
import { initServiceTextReveal } from '../js/components/service-text-reveal.js'

initStudioPage({
    contactLink: '.service-hero__cta',
    getContactTop({ header, panel }) {
        return window.scrollY + panel.getBoundingClientRect().top - header.getBoundingClientRect().bottom - 16
    },
})

initServiceProcess()
initServiceTextReveal()
enableRailDrag(document.querySelector('.service-cycle__cards'))
