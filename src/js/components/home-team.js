export function initHomeTeam() {
    const team = document.querySelector('.home-team')
    if (!team) return

    const rail = team.querySelector('.home-team__rail')
    const previous = team.querySelector('.home-team__previous')
    const next = team.querySelector('.home-team__next')
    const buttons = team.querySelector('.home-team__buttons')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    function updateControls() {
        const overflow = rail.scrollWidth - rail.clientWidth > 1
        if (!overflow && buttons.contains(document.activeElement)) rail.focus({ preventScroll: true })
        buttons.hidden = !overflow
        previous.disabled = rail.scrollLeft <= 1
        next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1
    }

    function move(direction) {
        const card = rail.querySelector('.home-team-card')
        const gap = parseFloat(getComputedStyle(rail).columnGap) || 0
        rail.scrollBy({
            left: direction * (card.getBoundingClientRect().width + gap),
            behavior: reducedMotion.matches ? 'instant' : 'smooth',
        })
    }

    previous.addEventListener('click', () => move(-1))
    next.addEventListener('click', () => move(1))
    rail.addEventListener('scroll', updateControls, { passive: true })
    new ResizeObserver(updateControls).observe(rail)
    updateControls()
}
