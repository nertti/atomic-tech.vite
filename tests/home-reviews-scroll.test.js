import assert from 'node:assert/strict'
import test from 'node:test'
import { createReviewRow } from '../src/js/components/home-reviews.js'

function eventTarget() {
    const listeners = new Map()
    return {
        addEventListener(type, listener) {
            if (!listeners.has(type)) listeners.set(type, [])
            listeners.get(type).push(listener)
        },
        emit(type, values = {}) {
            const event = { target: this, button: 0, preventDefault() {}, stopPropagation() {}, ...values }
            for (const listener of listeners.get(type) ?? []) listener(event)
        },
    }
}

function fixture({ reduced = false, width = 390 } = {}) {
    const originals = Object.fromEntries(['document', 'window', 'getComputedStyle', 'performance', 'setTimeout', 'clearTimeout']
        .map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
    const documentTarget = { ...eventTarget(), activeElement: null }
    const windowTarget = eventTarget()
    let now = 0
    let timerID = 0
    const timers = new Map()
    const groups = []
    const writes = []
    let left = 0

    function group(duplicate = false) {
        const item = {
            offsetWidth: 1900,
            dataset: duplicate ? { reviewClone: '' } : {},
            inert: duplicate,
            setAttribute(name, value) { this[name] = value },
            querySelector() { return { offsetWidth: 310 } },
            cloneNode() { return group() },
            remove() { groups.splice(groups.indexOf(item), 1) },
        }
        return item
    }
    const original = group()
    groups.push(original, group(true))
    const track = {
        querySelector() { return original },
        querySelectorAll() { return groups.filter(item => 'reviewClone' in item.dataset) },
        append(item) { groups.push(item) },
    }
    const classes = new Set(['home-reviews__row--0'])
    const row = {
        ...eventTarget(),
        clientWidth: width,
        classList: { add(name) { classes.add(name) }, remove(name) { classes.delete(name) }, contains(name) { return classes.has(name) } },
        querySelector() { return track },
        contains(element) { return element === row },
        get scrollWidth() { return groups.length * 1900 + (groups.length - 1) * 8 },
        get scrollLeft() { return left },
        set scrollLeft(value) {
            writes.push(value)
            left = Math.max(0, Math.min(value, row.scrollWidth - row.clientWidth))
        },
    }
    const replacements = {
        document: documentTarget,
        window: windowTarget,
        getComputedStyle: () => ({ columnGap: '8px' }),
        performance: { now: () => now },
        setTimeout: (callback, delay) => {
            const id = ++timerID
            timers.set(id, { callback, time: now + delay })
            return id
        },
        clearTimeout: id => timers.delete(id),
    }
    for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { value, writable: true, configurable: true })
    const state = createReviewRow(row, { matches: reduced })
    state.visible = true
    state.measure()
    writes.length = 0

    return {
        row, state, writes, groups, period: 1908, origin: row.scrollLeft,
        get now() { return now },
        get max() { return row.scrollWidth - row.clientWidth },
        nativeScroll(value) { left = value; row.emit('scroll') },
        startTouch() {
            row.emit('pointerdown', { pointerType: 'touch', pointerId: 1 })
            row.emit('touchstart', { touches: [{}] })
            // Native panning cancels pointer events while the finger is still down.
            documentTarget.emit('pointercancel', { pointerType: 'touch', pointerId: 1 })
        },
        endTouch() { documentTarget.emit('touchend', { touches: [] }) },
        cancelTouch() { documentTarget.emit('touchcancel', { touches: [] }) },
        advance(duration) {
            const target = now + duration
            let calls = 0
            while (true) {
                const next = [...timers].filter(([, item]) => item.time <= target).sort((a, b) => a[1].time - b[1].time)[0]
                if (!next) break
                assert.ok(++calls < 1000, 'idle handling must not spin indefinitely')
                timers.delete(next[0])
                now = next[1].time
                next[1].callback()
            }
            now = target
        },
        restore() {
            for (const [key, descriptor] of Object.entries(originals)) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor)
                else delete globalThis[key]
            }
        },
    }
}

function phase(left, period) {
    return ((left % period) + period) % period
}

test('a strong touch swipe can reach either physical edge without JS interrupting it', () => {
    const f = fixture()
    try {
        for (const nativeLeft of [-72, f.max + 72]) {
            f.startTouch()
            f.nativeScroll(nativeLeft)
            f.row.emit('scrollend')
            f.advance(3000)
            f.state.tick(64, f.now)
            assert.equal(f.row.scrollLeft, nativeLeft, 'active touch position must remain owned by the browser')
            assert.equal(f.writes.length, 0, 'touch and scrollend must not rewrite scrollLeft while a finger is down')
            f.endTouch()
            f.row.emit('scrollend')
            assert.ok(f.row.scrollLeft >= f.origin && f.row.scrollLeft < f.origin + f.period)
            assert.equal(phase(f.row.scrollLeft, f.period), phase(nativeLeft, f.period), 'recentring must show the same repeated content')
            f.writes.length = 0
        }
    } finally { f.restore() }
})

test('autoplay cannot move the row while native momentum is active', () => {
    const f = fixture()
    try {
        const nativeLeft = f.max - 14
        f.nativeScroll(nativeLeft)
        f.state.tick(64, f.now + 10000)
        assert.equal(f.row.scrollLeft, nativeLeft)
        assert.equal(f.writes.length, 0)
        f.row.emit('scrollend')
        assert.equal(phase(f.row.scrollLeft, f.period), phase(nativeLeft, f.period))
    } finally { f.restore() }
})

test('idle fallback recentres after touchend when scrollend is unavailable', () => {
    const f = fixture()
    try {
        f.startTouch()
        f.nativeScroll(f.max - 23)
        const visiblePhase = phase(f.row.scrollLeft, f.period)
        f.advance(500)
        assert.equal(f.writes.length, 0)
        f.endTouch()
        f.advance(500)
        assert.ok(f.row.scrollLeft >= f.origin && f.row.scrollLeft < f.origin + f.period)
        assert.equal(phase(f.row.scrollLeft, f.period), visiblePhase)
        f.advance(3000)
        const beforeAutoplay = f.row.scrollLeft
        f.state.tick(64, f.now)
        assert.notEqual(f.row.scrollLeft, beforeAutoplay, 'autoplay must resume after the completed swipe')
    } finally { f.restore() }
})

test('resize is deferred during touch and repeated measuring does not accumulate clones', () => {
    const f = fixture()
    try {
        assert.ok(f.groups.length >= 5, 'leave more than one repeat as a swipe buffer on each side')
        const before = [...f.groups]
        f.startTouch()
        f.row.clientWidth = 5000
        f.state.measure()
        assert.deepEqual(f.groups, before, 'measuring must not remove active touch content')
        assert.equal(f.writes.length, 0)
        f.endTouch()
        f.advance(500)
        const count = f.groups.length
        assert.ok(count > before.length, 'a wider viewport needs additional buffer groups')
        for (let i = 0; i < 10; i++) f.state.measure()
        assert.equal(f.groups.length, count)
        assert.ok(f.groups.slice(1).every(item => item.inert && item['aria-hidden'] === 'true'))
    } finally { f.restore() }
})

test('cancelled touch settles instead of permanently pausing the row', () => {
    const f = fixture()
    try {
        f.startTouch()
        f.nativeScroll(f.max - 31)
        f.cancelTouch()
        f.advance(3500)
        const beforeAutoplay = f.row.scrollLeft
        f.state.tick(64, f.now)
        assert.notEqual(f.row.scrollLeft, beforeAutoplay)
    } finally { f.restore() }
})

test('reduced motion keeps one native row without looping scroll position', () => {
    const f = fixture({ reduced: true })
    try {
        assert.equal(f.groups.length, 1)
        f.nativeScroll(f.max)
        const nativeLeft = f.row.scrollLeft
        f.row.emit('scrollend')
        f.advance(500)
        assert.equal(f.row.scrollLeft, nativeLeft)
        assert.equal(f.groups.length, 1)
    } finally { f.restore() }
})
