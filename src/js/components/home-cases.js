import '../../css/slick.css'
import $ from '../jquery-global.js'
import 'slick-carousel'
import { createCasesWheelController } from './cases-wheel.js'

export function initHomeCases() {
    const gallery = $('.home-cases__slides')
    if (!gallery.length) return

    const mobile = window.matchMedia('(max-width: 900px)')
    const header = document.querySelector('.home-header')
    const wheel = createCasesWheelController(direction => gallery.slick(direction > 0 ? 'slickNext' : 'slickPrev'))

    gallery[0].addEventListener('wheel', event => {
        if (mobile.matches || !gallery.hasClass('slick-initialized')) {
            wheel.reset()
            return
        }
        const viewportTop = Math.max(0, header?.getBoundingClientRect().bottom ?? 0)
        // On short screens, let the page scroll so the entire case can be read.
        if (gallery[0].clientHeight > window.innerHeight - viewportTop) {
            wheel.reset()
            return
        }
        wheel.handle(event, gallery.slick('getSlick'), gallery[0].clientHeight)
    }, { passive: false })

    function updateLayout() {
        wheel.reset()
        const initialized = gallery.hasClass('slick-initialized')
        if (mobile.matches) {
            if (initialized) gallery.slick('unslick')
        } else if (!initialized) {
            gallery.slick({
                infinite: false,
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                dots: true,
                vertical: true,
                verticalSwiping: true,
            })
        }
    }
    mobile.addEventListener('change', updateLayout)
    updateLayout()
}
