import { enableRailDrag } from './horizontal-rail.js'

function createReviewRow(row, reducedMotion) {
    const track = row.querySelector('.home-reviews__track')
    const original = track.querySelector('.home-reviews__group')
    const direction = row.classList.contains('home-reviews__row--0') ? -1 : 1
    let period = 0
    let position = 0
    let expectedLeft = 0
    let hovered = false
    let pointer = null
    let pausedUntil = 0

    row.classList.add('is-scrollable')
    enableRailDrag(row)

    const normalize = left => period ? period + ((left - period) % period + period) % period : left
    function writePosition(left) {
        position = normalize(left)
        row.scrollLeft = position
        expectedLeft = row.scrollLeft
    }
    function pause() {
        pausedUntil = performance.now() + 2500
    }
    function measure() {
        const progress = period ? (position - period) / period : 0
        track.querySelectorAll('[data-review-clone]').forEach(clone => clone.remove())
        period = reducedMotion.matches ? 0 : original.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0)
        if (period) {
            // Leave a complete repeat on either side, including on wide screens.
            while (row.scrollWidth - row.clientWidth < 2 * period + 1) {
                const clone = original.cloneNode(true)
                clone.setAttribute('aria-hidden', 'true')
                clone.dataset.reviewClone = ''
                clone.inert = true
                track.append(clone)
            }
        }
        writePosition(period ? period * (1 + progress) : 0)
    }

    row.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovered = true })
    row.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') hovered = false })
    row.addEventListener('pointerdown', event => { pointer = event.pointerId })
    function release(event) {
        if (pointer !== event.pointerId) return
        pointer = null
        pause()
    }
    document.addEventListener('pointerup', release)
    document.addEventListener('pointercancel', release)
    window.addEventListener('blur', () => { pointer = null })
    row.addEventListener('wheel', pause, { passive: true })
    row.addEventListener('scroll', () => {
        if (Math.abs(row.scrollLeft - expectedLeft) < 1) return
        pause()
        position = normalize(row.scrollLeft)
        if (Math.abs(position - row.scrollLeft) > 1) row.scrollLeft = position
        expectedLeft = row.scrollLeft
    }, { passive: true })
    row.addEventListener('keydown', event => {
        if (event.target !== row || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
        event.preventDefault()
        pause()
        const step = original.querySelector('.home-review').offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0)
        if (event.key === 'Home') writePosition(period)
        else if (event.key === 'End') writePosition(period ? 2 * period - step : row.scrollWidth - row.clientWidth)
        else writePosition(row.scrollLeft + (event.key === 'ArrowRight' ? step : -step))
    })

    return {
        row,
        visible: false,
        measure,
        tick(elapsed, time) {
            if (!this.visible || hovered || pointer !== null || time < pausedUntil || row.contains(document.activeElement)) return
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
