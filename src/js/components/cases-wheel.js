// Separate a deliberate wheel impulse from the decaying tail of a trackpad swipe.
export function createCasesWheelController(move, now = () => performance.now()) {
    let direction = 0
    let distance = 0
    let lastTime = -Infinity
    let lastMagnitude = 0
    let peak = 0
    let handled = false
    let handledAt = -Infinity

    function reset() {
        direction = 0
        distance = 0
        lastTime = -Infinity
        lastMagnitude = 0
        peak = 0
        handled = false
        handledAt = -Infinity
    }

    function handle(event, slider, pageHeight) {
        if (event.ctrlKey || event.defaultPrevented) return false
        const axis = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? pageHeight : 1
        const delta = axis * unit
        if (!Number.isFinite(delta) || delta === 0) return false

        const nextDirection = Math.sign(delta)
        const magnitude = Math.abs(delta)
        const time = now()
        if (nextDirection !== direction || time - lastTime > 180) reset()
        const previousMagnitude = lastMagnitude
        direction = nextDirection
        lastTime = time
        lastMagnitude = magnitude
        peak = Math.max(peak, magnitude)

        // Repeated mouse notches do not have to stop for 180ms to work again.
        // A fading trackpad tail still belongs to the slide already selected.
        const renewedImpulse = magnitude >= Math.max(24, peak * .8)
            || (magnitude >= 24 && magnitude > previousMagnitude * 1.5)
        if (handled && !slider.animating && time - handledAt >= 500 && renewedImpulse) {
            distance = 0
            handled = false
            peak = magnitude
        }

        const canMove = direction > 0 ? slider.currentSlide < slider.slideCount - 1 : slider.currentSlide > 0
        if (!canMove && !handled) return false
        event.preventDefault()
        if (handled || slider.animating) return true
        distance += delta
        if (Math.abs(distance) < 24) return true

        handled = true
        handledAt = time
        move(direction)
        return true
    }

    return { handle, reset }
}
