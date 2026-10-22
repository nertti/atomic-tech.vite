import $ from '../jquery-global.js'

export function initHomeCases() {
    const gallery = $('.home-cases__slides')
    if (!gallery.length) return

    const mobile = window.matchMedia('(max-width: 900px)')
    function updateLayout() {
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
