import $ from '../jquery-global.js'

export function initHomeCases() {
    const gallery = $('.home-cases__slides')
    if (!gallery.length) return

    const mobile = window.matchMedia('(max-width: 900px)')
    let wheelDirection = 0
    let wheelDistance = 0
    let wheelTime = -Infinity
    let wheelHandled = false

    gallery[0].addEventListener('wheel', event => {
        if (mobile.matches || event.ctrlKey || event.defaultPrevented || !gallery.hasClass('slick-initialized')) return

        const axis = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? gallery[0].clientHeight : 1
        const delta = axis * unit
        if (!Number.isFinite(delta) || delta === 0) return

        const direction = Math.sign(delta)
        const now = performance.now()
        if (direction !== wheelDirection || now - wheelTime > 180) {
            wheelDistance = 0
            wheelHandled = false
        }
        wheelDirection = direction
        wheelTime = now

        const slider = gallery.slick('getSlick')
        const canMove = direction > 0 ? slider.currentSlide < slider.slideCount - 1 : slider.currentSlide > 0
        if (!canMove && !wheelHandled) return

        event.preventDefault()
        // Keep a trackpad's momentum on the slide selected by this gesture.
        if (wheelHandled || slider.animating) return
        wheelDistance += delta
        if (Math.abs(wheelDistance) < 24) return

        wheelHandled = true
        gallery.slick(direction > 0 ? 'slickNext' : 'slickPrev')
    }, { passive: false })

    function updateLayout() {
        wheelDirection = 0
        wheelDistance = 0
        wheelTime = -Infinity
        wheelHandled = false
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
