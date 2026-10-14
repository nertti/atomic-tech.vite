import $ from '../jquery-global.js'

export function initHomeCases() {
    const gallery = $('.home-cases__slides')
    if (!gallery.length) return

    gallery.slick({
        infinite: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        vertical: true,
        verticalSwiping: true,
        responsive: [
            {
                breakpoint: 901,
                settings: {
                    vertical: false,
                    verticalSwiping: false,
                    adaptiveHeight: true,
                },
            },
        ],
    })
}
