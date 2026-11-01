export function initHomeWhy() {
    const rail = document.querySelector('.home-why__cards')
    if (!rail) return
    const cards = [...rail.querySelectorAll('.home-why-card')]
    const mobile = window.matchMedia('(max-width: 900px)')
    let activeCard = null
    let frame = null

    function update() {
        frame = null
        let nextCard = null
        if (mobile.matches && cards.length) {
            const max = rail.scrollWidth - rail.clientWidth
            if (rail.scrollLeft <= 1) nextCard = cards[0]
            else if (max - rail.scrollLeft <= 1) nextCard = cards.at(-1)
            else {
                const start = rail.getBoundingClientRect().left
                let closest = Infinity
                for (const card of cards) {
                    const distance = Math.abs(card.getBoundingClientRect().left - start)
                    if (distance < closest) {
                        closest = distance
                        nextCard = card
                    }
                }
            }
        }
        if (nextCard === activeCard) return
        activeCard = nextCard
        for (const card of cards) {
            const active = card === activeCard
            card.classList.toggle('is-active', active)
            if (active) card.setAttribute('aria-current', 'true')
            else card.removeAttribute('aria-current')
        }
    }

    function scheduleUpdate() {
        if (frame === null) frame = requestAnimationFrame(update)
    }

    rail.addEventListener('scroll', scheduleUpdate, { passive: true })
    new ResizeObserver(scheduleUpdate).observe(rail)
    mobile.addEventListener('change', scheduleUpdate)
    update()
}
