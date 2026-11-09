import assert from 'node:assert/strict'
import test from 'node:test'
import { createCasesWheelController } from '../src/js/components/cases-wheel.js'

function fixture(currentSlide = 0) {
    let time = 0
    let animationEnd = 0
    const moves = []
    const slider = { currentSlide, slideCount: 3, get animating() { return time < animationEnd } }
    const wheel = createCasesWheelController(direction => {
        moves.push(direction)
        slider.currentSlide += direction
        animationEnd = time + 500
    }, () => time)
    return {
        slider, moves, wheel,
        send(deltaY, elapsed = 0, options = {}) {
            time += elapsed
            let prevented = false
            wheel.handle({ deltaX: 0, deltaY, deltaMode: 0, preventDefault() { prevented = true }, ...options }, slider, 650)
            return prevented
        },
    }
}

test('continuous mouse notches advance through the cases and then release page scrolling', () => {
    const f = fixture()
    const consumed = []
    for (let i = 0; i < 30; i++) consumed.push(f.send(100, i ? 70 : 0))
    assert.deepEqual(f.moves, [1, 1])
    assert.equal(f.slider.currentSlide, 2)
    assert.equal(consumed[0], true)
    assert.equal(consumed.at(-1), false)
})

test('a long decaying trackpad tail stays on one case', () => {
    const f = fixture()
    for (const delta of [5, 12, 30, 60, 90, 80, 60, 40, 28]) f.send(delta, 16)
    for (let i = 0; i < 90; i++) assert.equal(f.send(18 * .96 ** i, 16), true)
    assert.deepEqual(f.moves, [1])
})

test('a fresh impulse works without waiting for the previous trackpad tail to stop', () => {
    const f = fixture()
    f.send(90)
    for (let i = 0; i < 40; i++) f.send(5, 16)
    assert.equal(f.send(60, 16), true)
    assert.deepEqual(f.moves, [1, 1])
})

test('the last case holds the current swipe tail but releases a renewed outward impulse', () => {
    const f = fixture(1)
    f.send(90)
    for (let i = 0; i < 40; i++) assert.equal(f.send(5, 16), true)
    assert.equal(f.send(100, 16), false)
    assert.deepEqual(f.moves, [1])
})

test('reverse scrolling can return through the cases and leave the first case', () => {
    const f = fixture(2)
    for (let i = 0; i < 30; i++) f.send(-100, i ? 70 : 0)
    assert.deepEqual(f.moves, [-1, -1])
    assert.equal(f.send(-100, 70), false)
    assert.equal(f.send(100, 70), true)
    assert.deepEqual(f.moves, [-1, -1, 1])
})

test('separate slow wheel gestures still accumulate small deltas', () => {
    const f = fixture()
    assert.equal(f.send(12), true)
    assert.deepEqual(f.moves, [])
    f.send(12, 40)
    assert.deepEqual(f.moves, [1])
    f.send(12, 700)
    f.send(12, 40)
    assert.deepEqual(f.moves, [1, 1])
})

test('line, page and horizontal wheel input use the same navigation bounds', () => {
    for (const options of [{ deltaMode: 1 }, { deltaMode: 2 }, { deltaX: 40 }]) {
        const f = fixture()
        f.send(options.deltaX ? 0 : 2, 0, options)
        assert.deepEqual(f.moves, [1])
    }
    assert.equal(fixture().send(-100), false)
    assert.equal(fixture(2).send(100), false)
})

test('zoom, already handled and invalid events do not capture page input', () => {
    const f = fixture()
    for (const [delta, options] of [[100, { ctrlKey: true }], [100, { defaultPrevented: true }], [0, {}], [NaN, {}], [Infinity, {}]]) {
        assert.equal(f.send(delta, 0, options), false)
    }
    assert.deepEqual(f.moves, [])
    f.send(100)
    f.wheel.reset()
    assert.equal(f.send(-100, 600), true)
    assert.deepEqual(f.moves, [1, -1])
})
