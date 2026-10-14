import assert from 'node:assert/strict'
import test from 'node:test'
import { initHomeTeam } from '../src/js/components/home-team.js'

function fixture(content, width) {
    const callbacks = {}
    const button = () => ({ disabled: false, addEventListener(type, callback) { this[type] = callback } })
    const previous = button()
    const next = button()
    const buttons = { hidden: false, contains: element => element === previous || element === next }
    const rail = {
        scrollWidth: content, clientWidth: width, scrollLeft: 0,
        addEventListener(type, callback) { callbacks[type] = callback },
        focus() { document.activeElement = rail },
    }
    const nodes = { '.home-team__rail': rail, '.home-team__previous': previous, '.home-team__next': next, '.home-team__buttons': buttons }
    const originals = Object.fromEntries(['document', 'window', 'ResizeObserver'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
    globalThis.document = { activeElement: null, querySelector: () => ({ querySelector: selector => nodes[selector] }) }
    globalThis.window = { matchMedia: () => ({ matches: true }) }
    globalThis.ResizeObserver = class {
        constructor(callback) { callbacks.resize = callback }
        observe(target) { assert.equal(target, rail) }
    }
    initHomeTeam()
    return {
        rail, previous, next, buttons, callbacks,
        restore() {
            for (const [key, descriptor] of Object.entries(originals)) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor)
                else delete globalThis[key]
            }
        },
    }
}

test('team hides both arrows when every card fits, including subpixel rounding', () => {
    const f = fixture(1001, 1000)
    try {
        assert.equal(f.buttons.hidden, true)
        assert.equal(f.previous.disabled, true)
        assert.equal(f.next.disabled, true)
    } finally { f.restore() }
})

test('team restores arrows after resize and updates the disabled edges', () => {
    const f = fixture(1524, 1872)
    try {
        assert.equal(f.buttons.hidden, true)
        f.rail.clientWidth = 1392
        f.callbacks.resize()
        assert.equal(f.buttons.hidden, false)
        assert.equal(f.previous.disabled, true)
        assert.equal(f.next.disabled, false)
        f.rail.scrollLeft = 132
        f.callbacks.scroll()
        assert.equal(f.previous.disabled, false)
        assert.equal(f.next.disabled, true)
    } finally { f.restore() }
})

test('team moves focus out of arrows before hiding them', () => {
    const f = fixture(1524, 1392)
    try {
        document.activeElement = f.next
        f.rail.clientWidth = 1872
        f.rail.scrollLeft = 0
        f.callbacks.resize()
        assert.equal(f.buttons.hidden, true)
        assert.equal(document.activeElement, f.rail)
    } finally { f.restore() }
})
