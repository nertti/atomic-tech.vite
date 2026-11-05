import { initStudioPage } from '../js/studio.js'
import '../css/home.css'
import '../css/home-sections.css'
import '../css/home-studio.css'
import '../css/home-reviews.css'
import '../css/home-v2.css'
import { initHomeCatalog } from '../js/components/home-catalog.js'
import { initHomeTeam } from '../js/components/home-team.js'
import { initHomeReviews } from '../js/components/home-reviews.js'
import { initHomeHero } from '../js/components/home-hero.js'
import { initHomeWhy } from '../js/components/home-why.js'
import { initHomeProcess } from '../js/components/home-process.js'

initStudioPage({
    contactLink: '.home-hero__cta',
    waitForFonts: true,
    getContactTop({ header, mobile, panel, form }) {
        if (mobile) return window.scrollY + panel.closest('.home-contact').getBoundingClientRect().top

        const viewportHeight = window.visualViewport?.height ?? window.innerHeight
        const headerBottom = header.getBoundingClientRect().bottom
        const availableHeight = viewportHeight - headerBottom
        const panelBox = panel.getBoundingClientRect()
        const targetBox = panelBox.height <= availableHeight ? panelBox : form.getBoundingClientRect()
        const freeSpace = availableHeight - targetBox.height
        const offset = headerBottom + (freeSpace >= 0 ? freeSpace / 2 : 8)
        return window.scrollY + targetBox.top - offset
    },
})

initHomeCatalog()
initHomeTeam()
initHomeReviews()
initHomeHero()
initHomeWhy()
initHomeProcess()
