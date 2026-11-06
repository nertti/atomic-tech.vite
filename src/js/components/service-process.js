import { findVisibleProcessStep, setProcessStepActive } from './process-steps.js'

export function initServiceProcess() {
    const list = document.querySelector('.service-process__steps')
    if (!list) return

    const steps = [...list.querySelectorAll('.service-process__step')]
    const details = steps.map(step => step.querySelector('details'))
    const summaries = details.map(detail => detail.querySelector('summary'))
    const header = document.querySelector('.home-header')
    let activeIndex = -1
    let frame = null

    function activate(index) {
        if (index === activeIndex) return
        activeIndex = index
        steps.forEach((step, stepIndex) => {
            const active = stepIndex === index
            setProcessStepActive(step, active)
            if (details[stepIndex].open !== active) details[stepIndex].open = active
        })
    }

    function update() {
        frame = null
        // Headings keep their position when the description opens or closes.
        const nextIndex = findVisibleProcessStep(summaries, header)
        if (nextIndex !== -1) activate(nextIndex)
    }

    function scheduleUpdate() {
        if (frame === null) frame = requestAnimationFrame(update)
    }

    details.forEach((detail, index) => {
        detail.addEventListener('toggle', () => {
            if (detail.open) activate(index)
            else if (index === activeIndex) activate(-1)
        })
    })

    activate(details.findIndex(detail => detail.open))
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('pageshow', scheduleUpdate)
    window.addEventListener('load', scheduleUpdate, { once: true })
    document.fonts.ready.then(scheduleUpdate)
    update()
}
