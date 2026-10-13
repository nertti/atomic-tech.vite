import $ from '../jquery-global.js'

export function initMarquee() {
    $('.marquee-js').each(function () {
        const itemsLength = $(this).find('.marquee-items > div').length
        let mDuration = itemsLength * 3000
        const align = $(this).attr('data-align')

        if ($(window).width() <= 767) {
            mDuration = itemsLength * 500
        }

        $(this).marquee({
            duration: mDuration,
            startVisible: true,
            duplicated: true,
            direction: align,
        })
    })
}
