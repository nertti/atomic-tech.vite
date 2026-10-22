import { enableRailDrag } from './horizontal-rail.js'

export function initHomeCatalog() {
    const catalog = document.querySelector('.home-catalog')
    if (!catalog) return

    const rail = catalog.querySelector('.home-catalog__cards')
    const cards = [...rail.querySelectorAll('.home-service-card')]
    const controls = catalog.querySelector('.home-catalog__controls')
    const previous = catalog.querySelector('.home-catalog__previous')
    const next = catalog.querySelector('.home-catalog__next')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    function updateControls() {
        const max = rail.scrollWidth - rail.clientWidth
        if (max <= 1 && controls.contains(document.activeElement)) rail.focus({ preventScroll: true })
        controls.hidden = max <= 1
        previous.disabled = rail.scrollLeft <= 1
        next.disabled = rail.scrollLeft >= max - 1
    }

    function scrollTo(left) {
        rail.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' })
    }

    function move(direction) {
        const max = rail.scrollWidth - rail.clientWidth
        const positions = cards.map(card => Math.min(max, card.offsetLeft - cards[0].offsetLeft))
        const target = direction > 0
            ? positions.find(left => left > rail.scrollLeft + 1)
            : positions.reverse().find(left => left < rail.scrollLeft - 1)
        if (target !== undefined) scrollTo(target)
    }

    previous.addEventListener('click', () => move(-1))
    next.addEventListener('click', () => move(1))
    rail.addEventListener('keydown', event => {
        if (event.target !== rail) return
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
        event.preventDefault()
        if (event.key === 'Home') scrollTo(0)
        else if (event.key === 'End') scrollTo(rail.scrollWidth - rail.clientWidth)
        else move(event.key === 'ArrowRight' ? 1 : -1)
    })

    enableRailDrag(rail)
    rail.addEventListener('scroll', updateControls, { passive: true })
    new ResizeObserver(updateControls).observe(rail)
    updateControls()
}
