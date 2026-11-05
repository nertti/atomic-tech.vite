export function initScrollProgress() {
    for (const progress of document.querySelectorAll('[data-scroll-progress]')) {
        const rail = document.querySelector(progress.dataset.scrollProgress)
        if (!rail) continue

        const update = () => {
            const { scrollWidth, clientWidth, scrollLeft } = rail
            const max = scrollWidth - clientWidth
            const width = scrollWidth ? Math.max(12, 56 * clientWidth / scrollWidth) : 56
            progress.hidden = max <= 1
            progress.style.setProperty('--thumb-width', `${width}px`)
            progress.style.setProperty('--thumb-offset', `${max > 0 ? (56 - width) * scrollLeft / max : 0}px`)
        }

        rail.addEventListener('scroll', update, { passive: true })
        new ResizeObserver(update).observe(rail)
        update()
    }
}
