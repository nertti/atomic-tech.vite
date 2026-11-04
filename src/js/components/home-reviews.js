import { enableRailDrag } from './horizontal-rail.js'

export function createReviewRow(row, reducedMotion) {
    const track = row.querySelector('.home-reviews__track')
    const original = track.querySelector('.home-reviews__group')
    const direction = row.classList.contains('home-reviews__row--0') ? -1 : 1
    let period = 0
    let origin = 0
    let position = 0
    let expectedLeft = 0
    let hovered = false
    let pointer = null
    let touches = 0
    let scrolling = false
    let settleTimer = 0
    let needsMeasure = false
    let pausedUntil = 0

    row.classList.add('is-scrollable')
    enableRailDrag(row)

    const normalize = left => period ? origin + ((left - origin) % period + period) % period : left
    function writePosition(left) {
        position = normalize(left)
        row.scrollLeft = position
        expectedLeft = row.scrollLeft
    }
    function pause() {
        pausedUntil = performance.now() + 2500
    }
    function settle() {
        clearTimeout(settleTimer)
        if (!scrolling || pointer !== null || touches) return
        scrolling = false
        if (needsMeasure) measure()
        else writePosition(position)
        pause()
    }
    function waitForScrollEnd() {
        clearTimeout(settleTimer)
        // Fallback for browsers without scrollend; every momentum event restarts it.
        settleTimer = setTimeout(settle, 180)
    }
    function measure() {
        if (pointer !== null || touches || scrolling) {
            needsMeasure = true
            return
        }
        needsMeasure = false
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0
        const previousPeriod = period || original.offsetWidth + gap
        const progress = previousPeriod ? ((position - origin) % previousPeriod + previousPeriod) % previousPeriod / previousPeriod : 0
        track.querySelectorAll('[data-review-clone]').forEach(clone => clone.remove())
        period = !reducedMotion.matches && original.offsetWidth > 0 ? original.offsetWidth + gap : 0
        origin = 0
        if (period) {
            // Keep enough content on both sides for a fast native swipe to coast.
            const buffer = Math.max(2, Math.ceil(row.clientWidth / period) + 1)
            origin = buffer * period
            for (let index = 0; index < 2 * buffer; index++) {
                const clone = original.cloneNode(true)
                clone.setAttribute('aria-hidden', 'true')
                clone.dataset.reviewClone = ''
                clone.inert = true
                track.append(clone)
            }
        }
        writePosition(period ? origin + period * progress : (original.offsetWidth + gap) * progress)
    }

    row.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovered = true })
    row.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') hovered = false })
    row.addEventListener('pointerdown', event => {
        pointer = event.pointerId
        scrolling = true
        clearTimeout(settleTimer)
        pause()
    })
    function release(event) {
        if (pointer !== event.pointerId) return
        pointer = null
        pause()
        waitForScrollEnd()
    }
    document.addEventListener('pointerup', release)
    document.addEventListener('pointercancel', release)
    row.addEventListener('touchstart', event => {
        touches = event.touches.length
        scrolling = true
        clearTimeout(settleTimer)
        pause()
    }, { passive: true })
    function releaseTouch(event) {
        if (!touches) return
        touches = event.touches.length
        pause()
        if (!touches) waitForScrollEnd()
    }
    document.addEventListener('touchend', releaseTouch, { passive: true })
    document.addEventListener('touchcancel', releaseTouch, { passive: true })
    window.addEventListener('blur', () => {
        pointer = null
        touches = 0
        pause()
        waitForScrollEnd()
    })
    row.addEventListener('wheel', pause, { passive: true })
    row.addEventListener('scroll', () => {
        if (Math.abs(row.scrollLeft - expectedLeft) < 1) return
        pause()
        // Do not write scrollLeft while the browser owns touch momentum.
        position = expectedLeft = row.scrollLeft
        scrolling = true
        waitForScrollEnd()
    }, { passive: true })
    row.addEventListener('scrollend', settle)
    row.addEventListener('keydown', event => {
        if (event.target !== row || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
        event.preventDefault()
        pause()
        const step = original.querySelector('.home-review').offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0)
        if (event.key === 'Home') writePosition(origin)
        else if (event.key === 'End') writePosition(period ? origin + period - step : row.scrollWidth - row.clientWidth)
        else writePosition(row.scrollLeft + (event.key === 'ArrowRight' ? step : -step))
    })

    return {
        row,
        visible: false,
        measure,
        tick(elapsed, time) {
            if (!period || !this.visible || hovered || pointer !== null || touches || scrolling || time < pausedUntil || row.contains(document.activeElement)) return
            writePosition(position + direction * period * elapsed / 80000)
        },
    }
}

export function initHomeReviews() {
    const rows = [...document.querySelectorAll('.home-reviews__row')]
    if (!rows.length) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const states = rows.map(row => createReviewRow(row, reducedMotion))
    let frame = 0
    let previousTime = 0

    function animate(time) {
        const elapsed = previousTime ? Math.min(time - previousTime, 64) : 0
        previousTime = time
        if (!document.hidden) states.forEach(state => state.tick(elapsed, time))
        frame = requestAnimationFrame(animate)
    }
    function updateMotion() {
        cancelAnimationFrame(frame)
        states.forEach(state => state.measure())
        previousTime = 0
        if (!reducedMotion.matches) frame = requestAnimationFrame(animate)
    }

    const visibility = new IntersectionObserver(entries => {
        entries.forEach(entry => { states.find(state => state.row === entry.target).visible = entry.isIntersecting })
    })
    const resize = new ResizeObserver(entries => {
        entries.forEach(entry => states.find(state => state.row === entry.target).measure())
    })
    states.forEach(state => { visibility.observe(state.row); resize.observe(state.row) })
    document.fonts.ready.then(() => states.forEach(state => state.measure()))
    reducedMotion.addEventListener('change', updateMotion)
    updateMotion()
}
