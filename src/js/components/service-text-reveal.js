export function initServiceTextReveal() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return

    const sections = [...document.querySelectorAll('.service-definition, .service-result')]
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return
            entry.target.parentElement.classList.add('is-revealed')
            observer.unobserve(entry.target)
        })
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })

    sections.forEach(section => {
        const text = section.querySelector('h2, p')
        if (!text) return
        section.classList.add('is-reveal-ready')
        observer.observe(text)
    })

    reducedMotion.addEventListener('change', event => {
        if (!event.matches) return
        observer.disconnect()
        sections.forEach(section => section.classList.remove('is-reveal-ready'))
    })
}
