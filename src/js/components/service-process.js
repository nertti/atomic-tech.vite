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
            step.classList.toggle('is-active', active)
            if (active) step.setAttribute('aria-current', 'step')
            else step.removeAttribute('aria-current')
            if (details[stepIndex].open !== active) details[stepIndex].open = active
        })
    }

    function update() {
        frame = null
        const top = Math.max(0, header?.getBoundingClientRect().bottom ?? 0)
        const bottom = window.innerHeight
        const center = (top + bottom) / 2
        let closest = Infinity
        let nextIndex = -1

        summaries.forEach((summary, index) => {
            // Headings keep their position when the description opens or closes.
            const bounds = summary.getBoundingClientRect()
            if (bounds.bottom <= top || bounds.top >= bottom) return
            const distance = Math.abs((bounds.top + bounds.bottom) / 2 - center)
            if (distance < closest) {
                closest = distance
                nextIndex = index
            }
        })

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
