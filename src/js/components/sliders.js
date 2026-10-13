import $ from '../jquery-global.js'

const sliderPrevArrowCode = '<div class="slider__arrow slider__arrow--prev flex"><svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.4209 5.93886H0.5M0.5 5.93886L5.57627 0.5M0.5 5.93886L5.57627 11.3777" stroke="white" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
const sliderNextArrowCode = '<div class="slider__arrow slider__arrow--next flex"><svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.5 5.93886H17.4209M17.4209 5.93886L12.3446 0.5M17.4209 5.93886L12.3446 11.3777" stroke="white" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'

export function initSliders() {
    if ($('.we__team').length) {
        $('.we__team').slick({
            infinite: false,
            slidesToShow: 2.5,
            slidesToScroll: 2,
            dots: false,
            arrows: true,
            variableWidth: true,
            prevArrow: sliderPrevArrowCode,
            nextArrow: sliderNextArrowCode,
        })
    }

    if ($('.single-slider').length) {
        $('.single-slider').slick({
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            arrows: true,
            adaptiveHeight: true,
            responsive: [
                {
                    breakpoint: 650,
                    settings: {
                        infinite: false,
                        arrows: false,
                        slidesToShow: 1.2,
                    },
                },
            ],
        })
    }

    if ($('.more__items').length) {
        $('.more__items').slick({
            infinite: true,
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: false,
            arrows: true,
            responsive: [
                {
                    breakpoint: 767,
                    settings: {
                        infinite: false,
                        arrows: false,
                        dots: true,
                        slidesToShow: 1,
                    },
                },
            ],
        })
    }

    if ($(window).width() <= 767 && $('.eco__items').length) {
        $('.eco__items').slick({
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            centerPadding: '60px',
            dots: true,
            arrows: false,
        })
    }
}
