import { findVisibleProcessStep, setProcessStepActive } from './process-steps.js'

export function initHomeProcess() {
    const steps = document.querySelector('.home-process__steps')
    if (!steps) return

    const cards = [...steps.querySelectorAll('.home-process-step')]
    const header = document.querySelector('.home-header')
    const mobile = window.matchMedia('(max-width: 900px)')
    let activeIndex = -1
    let frame = null

    function update() {
        frame = null
        const nextIndex = mobile.matches ? findVisibleProcessStep(cards, header) : -1
        if (nextIndex === activeIndex) return
        activeIndex = nextIndex
        cards.forEach((card, index) => setProcessStepActive(card, index === activeIndex))
    }

    function scheduleUpdate() {
        if (frame === null) frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    mobile.addEventListener('change', scheduleUpdate)
    const resize = new ResizeObserver(scheduleUpdate)
    resize.observe(steps)
    if (header) resize.observe(header)
    window.addEventListener('load', scheduleUpdate, { once: true })
    document.fonts.ready.then(scheduleUpdate)
    update()
}
