import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import Handlebars from 'handlebars'

const render = Handlebars.compile(readFileSync(new URL('../src/partials/home-reviews.hbs', import.meta.url), 'utf8'))

test('video block shows only its placeholder until a video is configured', () => {
    const html = render({ homeVideo: { src: '' }, reviewRows: [] })
    assert.match(html, /home-video__placeholder/)
    assert.doesNotMatch(html, /<video\b/)
})

test('configured video replaces the placeholder and retains native accessible controls', () => {
    const html = render({ homeVideo: { src: '/video/atomic.mp4', poster: '/img/poster.jpg', captions: '/video/atomic.vtt' }, reviewRows: [] })
    assert.doesNotMatch(html, /home-video__placeholder/)
    assert.match(html, /<video[^>]* controls playsinline preload="none"/)
    assert.match(html, /poster="\/img\/poster.jpg"/)
    assert.match(html, /<source src="\/video\/atomic.mp4" type="video\/mp4">/)
    assert.match(html, /<track kind="captions" src="\/video\/atomic.vtt" srclang="ru"/)
    assert.doesNotMatch(html, /\bautoplay\b/)
})

test('optional poster and captions do not leave empty asset requests', () => {
    const html = render({ homeVideo: { src: '/video/atomic.mp4' }, reviewRows: [] })
    assert.doesNotMatch(html, /\bposter=|<track\b/)
})
