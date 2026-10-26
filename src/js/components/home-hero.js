export function initHomeHero() {
    const hero = document.querySelector('.home-hero')
    if (!hero) return
    const video = hero.querySelector('.home-hero__media video')
    const ambient = hero.querySelector('.home-hero__ambient')
    const wide = window.matchMedia('(min-width: 1441px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let ambientVideo = null
    let visible = true

    function synchronize() {
        if (!ambientVideo || ambientVideo.readyState < 2 || video.readyState < 2) return
        if (Math.abs(ambientVideo.currentTime - video.currentTime) > .25) {
            ambientVideo.currentTime = video.currentTime
        }
    }

    function updateAmbient() {
        if (!ambientVideo) return
        if (wide.matches && visible && !document.hidden && !reducedMotion.matches && !video.paused) {
            synchronize()
            ambientVideo.play().catch(() => {})
        } else {
            ambientVideo.pause()
        }
    }

    function updatePlayback() {
        const playing = visible && !document.hidden && !reducedMotion.matches
        // The blurred video is created only when a wide screen actually needs it.
        if (wide.matches && playing && !ambientVideo) {
            ambientVideo = video.cloneNode(true)
            ambientVideo.removeAttribute('autoplay')
            ambientVideo.preload = 'none'
            ambientVideo.muted = true
            ambientVideo.addEventListener('loadeddata', () => {
                synchronize()
                updateAmbient()
            })
            ambient.append(ambientVideo)
        }
        if (playing) video.play().catch(() => {})
        else video.pause()
        updateAmbient()
    }

    video.addEventListener('play', updateAmbient)
    video.addEventListener('pause', updateAmbient)
    video.addEventListener('seeked', synchronize)
    video.addEventListener('timeupdate', () => {
        if (wide.matches && !video.paused) synchronize()
    })
    wide.addEventListener('change', updatePlayback)
    reducedMotion.addEventListener('change', updatePlayback)
    document.addEventListener('visibilitychange', updatePlayback)
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        updatePlayback()
    }).observe(hero)
    updatePlayback()
}
