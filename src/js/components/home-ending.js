import { enableRailDrag } from './horizontal-rail.js'

export function initHomeEnding() {
    const blog = document.querySelector('.home-blog')
    const rail = blog.querySelector('.home-blog__rail')
    const buttons = [...blog.querySelectorAll('[data-blog-slide]')]
    const cards = [...rail.querySelectorAll('.home-blog-card')]
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    enableRailDrag(rail)

    function updatePagination() {
        const overflow = rail.scrollWidth - rail.clientWidth > 1
        blog.querySelector('.home-blog__pagination').hidden = !overflow
        const center = rail.getBoundingClientRect().left + rail.clientWidth / 2
        const distances = cards.map(card => Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - center))
        const active = distances.indexOf(Math.min(...distances))
        buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === active)))
    }

    buttons.forEach((button, index) => button.addEventListener('click', () => {
        const card = cards[index]
        rail.scrollBy({
            left: card.getBoundingClientRect().left - rail.getBoundingClientRect().left - (rail.clientWidth - card.offsetWidth) / 2,
            behavior: reducedMotion.matches ? 'instant' : 'smooth',
        })
    }))
    rail.addEventListener('scroll', updatePagination, { passive: true })
    new ResizeObserver(updatePagination).observe(rail)
    updatePagination()

    const form = document.querySelector('.home-contact__form')
    form.addEventListener('submit', event => {
        event.preventDefault()
        // No application endpoint exists yet; never report an unsent request as sent.
        form.querySelector('.home-contact__status').hidden = false
    })
}
