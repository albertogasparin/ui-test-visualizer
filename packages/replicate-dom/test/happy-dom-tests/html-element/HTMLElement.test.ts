/*
  This file is derived from:
  https://github.com/capricorn86/happy-dom/blob/6cbcc10a1a227b36e38a7bc33203b2ae029cca95/packages/happy-dom/test/nodes/html-element/HTMLElement.test.ts ,
  available under the MIT License.

  Original licence below:
  =======================

  MIT License

  Copyright (c) 2019 David Ortner (capricorn86)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/* eslint-disable unicorn/prefer-dom-node-text-content */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Window } from 'happy-dom'
import type { Document, HTMLElement } from 'happy-dom'
import { addTestElement, initTestReplicaDom } from '../../test-setup'
import { serializeDomNode } from '../../../src'

describe(' HTMLElement', () => {
  let window: Window
  let document: Document

  let replicaWindow: Window
  let replicaDocument: Document

  beforeEach(() => {
    window = new Window()
    document = window.document

    replicaWindow = new Window()
    replicaDocument = replicaWindow.document

    initTestReplicaDom(window, replicaWindow)
  })

  function testElement(type: string) {
    return addTestElement(
      document,
      replicaDocument,
      type,
      'createElement',
    )
  }

  afterEach(() => {
    const primarySerialized = serializeDomNode(document.body, window)
    const replicaSerialized = serializeDomNode(replicaDocument.body, replicaWindow)
    expect(replicaSerialized).toEqual(primarySerialized)

    vi.restoreAllMocks()
  })

  describe('get tabIndex()', () => {
    it('returns the attribute "tabindex" as a number.', () => {
      const { primary, replica } = testElement('div')
      primary.setAttribute('tabindex', '5')
      expect(replica.tabIndex).toBe(5)
    })
  })

  describe('set tabIndex()', () => {
    it('sets the attribute "tabindex".', () => {
      const { primary, replica } = testElement('div')
      primary.tabIndex = 5
      expect(replica.getAttribute('tabindex')).toBe('5')
    })

    it('removes the attribute "tabindex" when set to "-1".', () => {
      const { primary, replica } = testElement('div')
      primary.tabIndex = 5
      primary.tabIndex = -1
      expect(replica.getAttribute('tabindex')).toBe(null)
    })
  })

  describe('get innerText()', () => {
    it('returns rendered text with line breaks between block and flex elements and without hidden elements being rendered if element is connected to the document.', () => {
      const { primary, replica } = testElement('div')

      primary.innerHTML = `<div>The <strong>quick</strong> brown fox</div><script>var key = "value";</script><style>button { background: red; }</style><div>Jumped over the lazy dog</div>`
      expect(replica.innerText).toBe('The quick brown fox\nJumped over the lazy dog')

      primary.innerHTML = `<div>The <strong>quick</strong> brown fox</div><span style="display: flex">Jumped over the lazy dog</span><div>.</div>`
      expect(replica.innerText).toBe('The quick brown fox\nJumped over the lazy dog\n.')
    })

    it('returns rendered text affected by the "text-transform" CSS property.', () => {
      const { primary, replica } = testElement('div')

      primary.innerHTML = `<div>The <strong>quick</strong> brown fox</div><span>Jumped over the lazy dog</span><style>span { text-transform: uppercase; display: block; }</style>`
      expect(replica.innerText).toBe('The quick brown fox\nJUMPED OVER THE LAZY DOG')

      primary.innerHTML = `<div>The <strong>quick</strong> brown fox</div><span>JUMPED OVER THE LAZY DOG</span><style>span { text-transform: lowercase; display: block; }</style>`
      expect(replica.innerText).toBe('The quick brown fox\njumped over the lazy dog')

      primary.innerHTML = `<div>The <strong>quick</strong> brown fox</div><span>jumped over the lazy dog</span><style>span { text-transform: capitalize; display: block; }</style>`
      expect(replica.innerText).toBe('The quick brown fox\nJumped Over The Lazy Dog')
    })
  })

  describe('set innerText()', () => {
    it('sets the value of the textContent property.', () => {
      const { primary, replica } = testElement('div')

      const div = document.createElement('div')
      const textNode1 = document.createTextNode('text1')
      const textNode2 = document.createTextNode('text2')

      primary.appendChild(div)
      primary.appendChild(textNode1)
      primary.appendChild(textNode2)

      primary.textContent = 'new_text'

      expect(replica.innerText).toBe('new_text')
      expect(replica.innerText).toBe(replica.textContent)
      expect(replica.childNodes.length).toBe(1)
      expect(replica.childNodes[0]?.textContent).toBe('new_text')
    })
  })

  describe('get style()', () => {
    it('returns styles.', () => {
      const { primary, replica } = testElement('div')

      primary.setAttribute('style', 'border-radius: 2px; padding: 2px;')

      expect(replica.style.length).toEqual(8)
      expect(replica.style[0]).toEqual('border-top-left-radius')
      expect(replica.style[1]).toEqual('border-top-right-radius')
      expect(replica.style[2]).toEqual('border-bottom-right-radius')
      expect(replica.style[3]).toEqual('border-bottom-left-radius')
      expect(replica.style[4]).toEqual('padding-top')
      expect(replica.style[5]).toEqual('padding-right')
      expect(replica.style[6]).toEqual('padding-bottom')
      expect(replica.style[7]).toEqual('padding-left')
      expect(replica.style.borderRadius).toEqual('2px')
      expect(replica.style.padding).toEqual('2px')
      expect(replica.style.cssText).toEqual('border-radius: 2px; padding: 2px;')

      primary.setAttribute('style', 'border-radius: 4px; padding: 4px;')

      expect(replica.style.length).toEqual(8)
      expect(replica.style[0]).toEqual('border-top-left-radius')
      expect(replica.style[1]).toEqual('border-top-right-radius')
      expect(replica.style[2]).toEqual('border-bottom-right-radius')
      expect(replica.style[3]).toEqual('border-bottom-left-radius')
      expect(replica.style[4]).toEqual('padding-top')
      expect(replica.style[5]).toEqual('padding-right')
      expect(replica.style[6]).toEqual('padding-bottom')
      expect(replica.style[7]).toEqual('padding-left')

      expect(replica.style.borderRadius).toEqual('4px')
      expect(replica.style.padding).toEqual('4px')
      expect(replica.style.cssText).toEqual('border-radius: 4px; padding: 4px;')
    })

    it('setting a property changes the "style" attribute.', () => {
      const { primary, replica } = testElement('div')

      primary.setAttribute('style', 'border-radius: 2px; padding: 2px;')

      primary.style.borderRadius = '4rem'
      primary.style.backgroundColor = 'green'

      expect(replica.style.length).toEqual(9)
      expect(replica.style[0]).toEqual('border-top-left-radius')
      expect(replica.style[1]).toEqual('border-top-right-radius')
      expect(replica.style[2]).toEqual('border-bottom-right-radius')
      expect(replica.style[3]).toEqual('border-bottom-left-radius')
      expect(replica.style[4]).toEqual('padding-top')
      expect(replica.style[5]).toEqual('padding-right')
      expect(replica.style[6]).toEqual('padding-bottom')
      expect(replica.style[7]).toEqual('padding-left')
      expect(replica.style[8]).toEqual('background-color')

      expect(replica.style.borderRadius).toEqual('4rem')
      expect(replica.style.padding).toEqual('2px')
      expect(replica.style.backgroundColor).toEqual('green')

      expect(replica.style.cssText).toEqual(
        'border-radius: 4rem; padding: 2px; background-color: green;',
      )

      expect(replica.getAttribute('style')).toEqual(
        'border-radius: 4rem; padding: 2px; background-color: green;',
      )
    })

    it('settings a property to empty string also removes it.', () => {
      const { primary, replica } = testElement('div')

      primary.setAttribute('style', 'border-radius: 2px; padding: 2px;')

      primary.style.borderRadius = ''
      primary.style.backgroundColor = 'green'

      expect(replica.style.length).toEqual(5)
      expect(replica.style[0]).toEqual('padding-top')
      expect(replica.style[1]).toEqual('padding-right')
      expect(replica.style[2]).toEqual('padding-bottom')
      expect(replica.style[3]).toEqual('padding-left')
      expect(replica.style[4]).toEqual('background-color')
      expect(replica.style[5]).toBe(undefined)

      expect(replica.style.borderRadius).toEqual('')
      expect(replica.style.padding).toEqual('2px')
      expect(replica.style.backgroundColor).toEqual('green')

      expect(replica.style.cssText).toEqual('padding: 2px; background-color: green;')

      expect(replica.getAttribute('style')).toEqual('padding: 2px; background-color: green;')
    })
  })

  describe('set style()', () => {
    it('sets the value of the style.cssText property.', () => {
      const { primary, replica } = testElement('div')

      primary.style = 'border-radius: 2px; padding: 2px;'

      expect(replica.style.cssText).toEqual('border-radius: 2px; padding: 2px;')
      expect(replica.style.borderRadius).toEqual('2px')
      expect(replica.style.padding).toEqual('2px')
      expect(replica.getAttribute('style')).toEqual('border-radius: 2px; padding: 2px;')
      expect(replica.outerHTML).toEqual('<div style="border-radius: 2px; padding: 2px;"></div>')

      primary.style = ''

      expect(replica.style.cssText).toEqual('')
      expect(replica.style.borderRadius).toEqual('')
      expect(replica.style.padding).toEqual('')
      expect(replica.getAttribute('style')).toEqual('')
      expect(replica.outerHTML).toEqual('<div style=""></div>')

      primary.style = null

      expect(replica.style.cssText).toEqual('')
      expect(replica.style.borderRadius).toEqual('')
      expect(replica.style.padding).toEqual('')
      expect(replica.getAttribute('style')).toEqual('')
      expect(replica.outerHTML).toEqual('<div style=""></div>')
    })
  })

  describe('get dataset()', () => {
    it('returns a Proxy behaving like an object that can add, remove, set and get element attributes prefixed with "data-".', () => {
      const { primary, replica } = testElement('div')

      primary.setAttribute('test-alpha', 'value1')
      primary.setAttribute('data-test-alpha', 'value2')
      primary.setAttribute('test-beta', 'value3')
      primary.setAttribute('data-test-beta', 'value4')

      const dataset = primary.dataset

      expect(dataset).toEqual(primary.dataset)
      expect(dataset).toEqual(replica.dataset)
      expect(Object.keys(dataset)).toEqual(['testAlpha', 'testBeta'])
      expect(Object.values(dataset)).toEqual(['value2', 'value4'])

      dataset.testGamma = 'value5'

      expect(replica.getAttribute('data-test-gamma')).toBe('value5')
      expect(Object.keys(dataset)).toEqual(['testAlpha', 'testBeta', 'testGamma'])
      expect(Object.values(dataset)).toEqual(['value2', 'value4', 'value5'])

      primary.setAttribute('data-test-delta', 'value6')

      expect(dataset.testDelta).toBe('value6')
      expect(Object.keys(dataset)).toEqual(['testAlpha', 'testBeta', 'testGamma', 'testDelta'])
      expect(Object.values(dataset)).toEqual(['value2', 'value4', 'value5', 'value6'])

      delete dataset.testDelta

      expect(replica.getAttribute('data-test-delta')).toBe(null)
      expect(Object.keys(dataset)).toEqual(['testAlpha', 'testBeta', 'testGamma'])
      expect(Object.values(dataset)).toEqual(['value2', 'value4', 'value5'])

      delete dataset.nonExistentKey
    })

    // https://github.com/capricorn86/happy-dom/issues/493
    it('creates dataset from "innerHTML" markup.', () => {
      const { primary, replica } = testElement('main')
      primary.innerHTML = `<button data-test="test"></button>`
      const button = <HTMLElement>replica.querySelector('button')
      expect(button.dataset.test).toBe('test')
    })

    // https://github.com/capricorn86/happy-dom/issues/493
    it('finds closest ancestor element by data attribute.', () => {
      const { primary, replica } = testElement('main')
      const div = <HTMLElement>document.createElement('div')
      div.id = 'test-div'
      div.dataset.test = 'test'
      div.innerHTML = '<button>label</button>'
      primary.append(div)
      const button = <HTMLElement>replica.querySelector('button')
      expect(button.closest('[data-test]').id).toBe('test-div')
    })
  })

  describe('get dir()', () => {
    it('returns the attribute "dir".', () => {
      const { primary, replica } = testElement('div')
      primary.setAttribute('dir', 'rtl')
      expect((replica as HTMLElement).dir).toBe('rtl')
    })
  })

  describe('set dir()', () => {
    it('sets the attribute "tabindex".', () => {
      const { primary, replica } = testElement('div')
      ;(primary as HTMLElement).dir = 'rtl'
      expect(replica.getAttribute('dir')).toBe('rtl')
    })
  })

  describe('get hidden()', () => {
    it('returns the attribute "hidden".', () => {
      const { primary, replica } = testElement('div')
      primary.setAttribute('hidden', '')
      expect((replica as HTMLElement).hidden).toBe(true)
    })
  })

  describe('set hidden()', () => {
    it('sets the attribute "hidden".', () => {
      const { primary, replica } = testElement('div')
      ;(primary as HTMLElement).hidden = true
      expect(replica.getAttribute('hidden')).toBe('')
      ;(primary as HTMLElement).hidden = false
      expect(replica.getAttribute('hidden')).toBe(null)
    })
  })

  for (const property of ['lang', 'title']) {
    describe(`get ${property}`, () => {
      it(`returns the attribute "`, () => {
        const { primary, replica } = testElement('div')
        primary.setAttribute(property, 'value')
        // @ts-expect-error should have a value
        expect(replica[property]).toBe('value')
      })
    })

    describe(`set ${property}()`, () => {
      it(`sets the attribute "`, () => {
        const { primary, replica } = testElement('div')
        // @ts-expect-error should have a value
        primary[property] = 'value'
        expect(replica.getAttribute(property)).toBe('value')
      })
    })
  }

  describe('setAttributeNode()', () => {
    it('sets css text of existing CSSStyleDeclaration.', () => {
      const { primary, replica } = testElement('div')
      primary.style.background = 'green'
      primary.style.color = 'black'
      primary.setAttribute('style', 'color: green')
      expect(replica.style.length).toEqual(1)
      expect(replica.style[0]).toEqual('color')
      expect(replica.style.color).toEqual('green')
    })
  })

  describe('removeAttributeNode()', () => {
    it('removes property from CSSStyleDeclaration.', () => {
      const { primary, replica } = testElement('div')
      primary.style.background = 'green'
      primary.style.color = 'black'
      primary.removeAttribute('style')
      expect(replica.style.length).toEqual(0)
      expect(replica.style.cssText).toEqual('')
    })
  })
})
