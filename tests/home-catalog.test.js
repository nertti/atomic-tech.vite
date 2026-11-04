import assert from 'node:assert/strict'
import test from 'node:test'
import { getCatalogPinTop } from '../src/js/components/home-catalog.js'

// Browser-measured geometry at 1000 px wide: heading, 496 px cards, then controls.
const catalog = {
    headerBottom: 82,
    paddingTop: 100,
    contentHeight: 694,
    railTop: 258,
    railHeight: 496,
}

function assertCardsVisible(top, geometry) {
    assert.notEqual(top, null, 'the horizontal stage must stay enabled')
    const cardTop = top + geometry.railTop
    const cardBottom = cardTop + geometry.railHeight
    assert.ok(cardTop >= geometry.headerBottom + 8, 'card headings must remain below the fixed header')
    assert.ok(cardBottom <= geometry.viewportHeight - 8, 'the last service links must remain above the bottom edge')
}

test('catalog keeps horizontal scrolling at 1000x600 with the complete cards visible', () => {
    const geometry = { ...catalog, viewportHeight: 600 }
    const top = getCatalogPinTop(geometry)
    assertCardsVisible(top, geometry)
    assert.equal(top, -162, 'the heading should scroll away before the horizontal stage starts')
})

test('a tall screen retains the original heading and cards pin position', () => {
    const geometry = { ...catalog, viewportHeight: 900 }
    const top = getCatalogPinTop(geometry)
    assert.equal(top + geometry.paddingTop, geometry.headerBottom + 16)
    assert.ok(top + geometry.paddingTop + geometry.contentHeight <= geometry.viewportHeight - 16)
    assertCardsVisible(top, geometry)
})

test('cards can pin at the exact minimum height and fall back one pixel below it', () => {
    const geometry = { ...catalog, viewportHeight: 594 }
    const top = getCatalogPinTop(geometry)
    assertCardsVisible(top, geometry)
    assert.equal(top + geometry.railTop, geometry.headerBottom + 8)
    assert.equal(top + geometry.railTop + geometry.railHeight, geometry.viewportHeight - 8)
    assert.equal(getCatalogPinTop({ ...geometry, viewportHeight: 593 }), null)
})

test('an extremely short screen keeps native scrolling instead of pinning clipped cards', () => {
    assert.equal(getCatalogPinTop({ ...catalog, viewportHeight: 500 }), null)
})
