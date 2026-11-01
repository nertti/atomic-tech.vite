export function initHomeProcess() {
    const steps = document.querySelector('.home-process__steps')
    if (!steps) return

    const cards = [...steps.querySelectorAll('.home-process-step')]
    const header = document.querySelector('.home-header')
    const mobile = window.matchMedia('(max-width: 900px)')
    let activeCard = null
    let frame = null

    function update() {
        frame = null
        let nextCard = null
        if (mobile.matches) {
            const top = Math.max(0, header?.getBoundingClientRect().bottom ?? 0)
            const bottom = window.innerHeight
            const center = (top + bottom) / 2
            let closest = Infinity

            for (const card of cards) {
                const bounds = card.getBoundingClientRect()
                if (bounds.bottom <= top || bounds.top >= bottom) continue
                const distance = Math.abs((bounds.top + bounds.bottom) / 2 - center)
                if (distance < closest) {
                    closest = distance
                    nextCard = card
                }
            }
        }

        if (nextCard === activeCard) return
        activeCard = nextCard
        for (const card of cards) {
            const active = card === activeCard
            card.classList.toggle('is-active', active)
            if (active) card.setAttribute('aria-current', 'step')
            else card.removeAttribute('aria-current')
        }
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
