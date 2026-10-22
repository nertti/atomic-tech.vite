export function enableRailDrag(rail) {
    let drag = null
    let suppressClick = false

    // Touch keeps native scrolling; capture the mouse only after a real drag.
    rail.addEventListener('pointerdown', event => {
        suppressClick = false
        if (event.pointerType !== 'mouse' || event.button !== 0 || rail.scrollWidth <= rail.clientWidth) return
        drag = { id: event.pointerId, x: event.clientX, left: rail.scrollLeft, active: false }
    })
    rail.addEventListener('pointermove', event => {
        if (!drag || event.pointerId !== drag.id) return
        const distance = event.clientX - drag.x
        if (!drag.active && Math.abs(distance) < 6) return
        if (!drag.active) {
            drag.active = true
            rail.classList.add('is-dragging')
            rail.setPointerCapture(event.pointerId)
        }
        event.preventDefault()
        rail.scrollLeft = drag.left - distance
    })
    rail.addEventListener('pointerleave', () => {
        if (drag && !drag.active) drag = null
    })
    function finishDrag(event) {
        if (!drag || event.pointerId !== drag.id) return
        const active = drag.active
        drag = null
        rail.classList.remove('is-dragging')
        if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId)
        if (active) {
            suppressClick = true
            setTimeout(() => { suppressClick = false }, 0)
        }
    }
    rail.addEventListener('pointerup', finishDrag)
    rail.addEventListener('pointercancel', finishDrag)
    rail.addEventListener('lostpointercapture', finishDrag)
    rail.addEventListener('dragstart', event => event.preventDefault())
    rail.addEventListener('click', event => {
        if (!suppressClick) return
        event.preventDefault()
        event.stopPropagation()
    }, true)
}
