export function findVisibleProcessStep(elements, header) {
    const top = Math.max(0, header?.getBoundingClientRect().bottom ?? 0)
    const bottom = window.innerHeight
    const center = (top + bottom) / 2
    let closestDistance = Infinity
    let closestIndex = -1

    for (const [index, element] of elements.entries()) {
        const bounds = element.getBoundingClientRect()
        if (bounds.bottom <= top || bounds.top >= bottom) continue
        const distance = Math.abs((bounds.top + bounds.bottom) / 2 - center)
        if (distance < closestDistance) {
            closestDistance = distance
            closestIndex = index
        }
    }

    return closestIndex
}

export function setProcessStepActive(step, active) {
    step.classList.toggle('is-active', active)
    if (active) step.setAttribute('aria-current', 'step')
    else step.removeAttribute('aria-current')
}
