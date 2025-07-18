/*
  This file is derived from:
  https://github.com/capricorn86/happy-dom/blob/6cbcc10a1a227b36e38a7bc33203b2ae029cca95/packages/happy-dom/test/nodes/html-iframe-element/HTMLIFrameElement.test.ts ,
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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BrowserWindow, Window } from 'happy-dom'
import type { Document, IHTMLIFrameElement, IResponse, Window } from 'happy-dom'
import type IRequestInfo from 'happy-dom/lib/fetch/types/IRequestInfo'
import DOMTokenList from 'happy-dom/lib/dom-token-list/DOMTokenList.js'
import { addTestElement, initTestReplicaDom } from '../../test-setup'
import { serializeDomNode } from '../../../src'

describe('hTMLIFrameElement', () => {
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
    ) as { primary: IHTMLIFrameElement, replica: IHTMLIFrameElement }
  }

  afterEach(() => {
    expect(replicaDocument.body.outerHTML).toBe(document.body.outerHTML)

    const primarySerialized = serializeDomNode(document.body, window)
    const replicaSerialized = serializeDomNode(replicaDocument.body, replicaWindow)
    expect(replicaSerialized).toEqual(primarySerialized)

    vi.restoreAllMocks()
  })

  for (const property of ['src', 'allow', 'height', 'width', 'name', 'srcdoc']) {
    describe(`get ${property}()`, () => {
      it(`returns the "`, () => {
        const newIframe = document.createElement('iframe') as IHTMLIFrameElement
        newIframe.setAttribute(property, 'value')
        // @ts-expect-error property should exist
        expect(newIframe[property]).toBe('value')
      })
    })

    describe(`set ${property}()`, () => {
      it(`sets the attribute "`, () => {
        const newIframe = document.createElement('iframe') as IHTMLIFrameElement
        // @ts-expect-error property should exist
        newIframe[property] = 'value'
        expect(newIframe.getAttribute(property)).toBe('value')
      })
    })
  }

  describe('get sandbox()', () => {
    it('returns DOMTokenList', () => {
      const iframe = document.createElement('iframe') as IHTMLIFrameElement
      document.body.appendChild(iframe)
      const replicaIframe = replicaDocument.body.children[0] as IHTMLIFrameElement

      expect(replicaIframe.sandbox).toBeInstanceOf(DOMTokenList)
      iframe.sandbox.add('allow-forms', 'allow-scripts')
      expect(replicaIframe.sandbox.toString()).toBe('allow-forms allow-scripts')
    })

    it('returns values from attribute', () => {
      const iframe = document.createElement('iframe') as IHTMLIFrameElement
      document.body.appendChild(iframe)
      const replicaIframe = replicaDocument.body.children[0] as IHTMLIFrameElement

      iframe.setAttribute('sandbox', 'allow-forms allow-scripts')
      expect(replicaIframe.sandbox.toString()).toBe('allow-forms allow-scripts')
    })
  })

  describe('set sandbox()', () => {
    it('sets attribute', () => {
      const iframe = document.createElement('iframe') as IHTMLIFrameElement
      document.body.appendChild(iframe)
      const replicaIframe = replicaDocument.body.children[0] as IHTMLIFrameElement

      iframe.sandbox = 'allow-forms allow-scripts'
      expect(replicaIframe.getAttribute('sandbox')).toBe('allow-forms allow-scripts')

      iframe.sandbox
				= 'allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols'
      expect(replicaIframe.sandbox.toString()).toBe(
        'allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols',
      )
    })

    it('updates the DOMTokenList indicies when setting the sandbox attribute', () => {
      const iframe = document.createElement('iframe') as IHTMLIFrameElement
      document.body.appendChild(iframe)
      const replicaIframe = replicaDocument.body.children[0] as IHTMLIFrameElement

      iframe.sandbox = 'allow-forms allow-scripts'
      expect(replicaIframe.sandbox.length).toBe(2)
      expect(replicaIframe.sandbox[0]).toBe('allow-forms')
      expect(replicaIframe.sandbox[1]).toBe('allow-scripts')

      iframe.sandbox = 'allow-scripts allow-forms'
      expect(replicaIframe.sandbox.length).toBe(2)
      expect(replicaIframe.sandbox[0]).toBe('allow-scripts')
      expect(replicaIframe.sandbox[1]).toBe('allow-forms')

      iframe.sandbox = 'allow-forms'
      expect(replicaIframe.sandbox.length).toBe(1)
      expect(replicaIframe.sandbox[0]).toBe('allow-forms')
      expect(replicaIframe.sandbox[1]).toBe(undefined)

      iframe.sandbox = ''

      expect(replicaIframe.sandbox.length).toBe(0)
      expect(replicaIframe.sandbox[0]).toBe(undefined)

      iframe.sandbox = 'allow-forms allow-scripts allow-forms'
      expect(replicaIframe.sandbox.length).toBe(2)
      expect(replicaIframe.sandbox[0]).toBe('allow-forms')
      expect(replicaIframe.sandbox[1]).toBe('allow-scripts')

      iframe.sandbox = 'allow-forms allow-scripts allow-modals'
      expect(replicaIframe.sandbox.length).toBe(3)
      expect(replicaIframe.sandbox[0]).toBe('allow-forms')
      expect(replicaIframe.sandbox[1]).toBe('allow-scripts')
      expect(replicaIframe.sandbox[2]).toBe('allow-modals')
    })

    it('console error occurs when add an invalid sandbox flag', () => {
      const iframe = document.createElement('iframe') as IHTMLIFrameElement
      document.body.appendChild(iframe)
      const replicaIframe = replicaDocument.body.children[0] as IHTMLIFrameElement

      iframe.sandbox = 'invalid'
      expect(window.happyDOM.virtualConsolePrinter.readAsString()).toBe(
				`Error while parsing the 'sandbox' attribute: 'invalid' is an invalid sandbox flag.\n`,
      )
      expect(replicaIframe.sandbox.toString()).toBe('invalid')
      expect(replicaIframe.getAttribute('sandbox')).toBe('invalid')

      iframe.setAttribute('sandbox', 'first-invalid second-invalid')
      expect(window.happyDOM.virtualConsolePrinter.readAsString()).toBe(
				`Error while parsing the 'sandbox' attribute: 'first-invalid', 'second-invalid' are invalid sandbox flags.\n`,
      )
      expect(replicaIframe.sandbox.toString()).toBe('first-invalid second-invalid')
      expect(replicaIframe.getAttribute('sandbox')).toBe('first-invalid second-invalid')
    })
  })

  describe('get contentWindow()', () => {
    it('returns content window for "about:blank".', () => {
      const { primary, replica } = addTestElement(
        document,
        replicaDocument,
        'div',
        'createElement',
      )
      const newIframe = document.createElement('iframe') as IHTMLIFrameElement
      newIframe.src = 'about:blank'
      expect((replica.childNodes[0] as IHTMLIFrameElement)?.contentWindow).toBeUndefined()
      expect((replica.childNodes[0] as IHTMLIFrameElement)?.contentDocument).toBeUndefined()
      primary.appendChild(newIframe)
      expect((replica.childNodes[0] as IHTMLIFrameElement).contentWindow === (replica.childNodes?.[0] as IHTMLIFrameElement)?.contentDocument?.defaultView).toBe(true)
      expect((replica.childNodes[0] as IHTMLIFrameElement).contentDocument?.documentElement.innerHTML).toBe('<head></head><body></body>')
    })

    it('returns content window for "javascript:scroll(10, 20)".', async () => {
      const newIframe = document.createElement('iframe') as IHTMLIFrameElement
      await new Promise((resolve) => {
        newIframe.src = 'javascript:scroll(10, 20)'
        document.body.appendChild(newIframe)
        const replicaIframe = replicaDocument.body.children[0] as IHTMLIFrameElement

        expect(replicaIframe.contentWindow === replicaIframe.contentDocument?.defaultView).toBe(true)

        replicaIframe.addEventListener('load', () => {
          expect(replicaIframe.contentDocument?.documentElement.scrollLeft).toBe(10)
          expect(replicaIframe.contentDocument?.documentElement.scrollTop).toBe(20)
          resolve(null)
        })
      })
    })

    it('returns content window for URL with same origin when the response has an "x-frame-options" set to "sameorigin".', async () => {
      const { primary, replica } = addTestElement(
        document,
        replicaDocument,
        'div',
        'createElement',
      )

      const newIframe = document.createElement('iframe') as IHTMLIFrameElement
      await new Promise((resolve) => {
        const responseHTML = '<html><head></head><body>Test</body></html>'
        let fetchedURL: string | null = null

        vi.spyOn(BrowserWindow.prototype, 'fetch').mockImplementation((url: IRequestInfo) => {
          fetchedURL = <string>url
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(<IResponse>(<unknown>{
                text: () => Promise.resolve(responseHTML),
                ok: true,
                headers: new Headers({ 'x-frame-options': 'sameorigin' }),
              }))
            }, 1)
          })
        })

        window.happyDOM?.setURL('https://localhost:8080')
        replicaWindow.happyDOM?.setURL('https://localhost:8080')

        newIframe.src = 'https://localhost:8080/iframe.html'

        primary.appendChild(newIframe)
        const replicaIframe = replica.childNodes[0] as IHTMLIFrameElement
        replicaIframe.addEventListener('load', () => {
          expect(replicaIframe.contentDocument?.location.href).toBe('https://localhost:8080/iframe.html')
          expect(fetchedURL).toBe('https://localhost:8080/iframe.html')
          expect(replicaIframe.contentWindow === replicaIframe.contentDocument?.defaultView).toBe(true)
          expect(`<html>${replicaIframe.contentDocument?.documentElement.innerHTML}</html>`).toBe(
            responseHTML,
          )
          resolve(null)
        })
      })
    })

    it('returns content window for URL with same origin.', async () => {
      const newIframe = document.createElement('iframe') as IHTMLIFrameElement

      await new Promise((resolve) => {
        const responseHTML = '<html><head></head><body>Test</body></html>'
        let fetchedURL: string | null = null

        vi.spyOn(BrowserWindow.prototype, 'fetch').mockImplementation((url: IRequestInfo) => {
          fetchedURL = <string>url
          return Promise.resolve(<IResponse>(<unknown>{
            text: () => Promise.resolve(responseHTML),
            ok: true,
            headers: new Headers(),
          }))
        })

        window.happyDOM?.setURL('https://localhost:8080')
        replicaWindow.happyDOM?.setURL('https://localhost:8080')

        newIframe.src = 'https://localhost:8080/iframe.html'

        document.body.appendChild(newIframe)
        const replicaIframe = replicaDocument.body.childNodes[0] as IHTMLIFrameElement
        replicaIframe.addEventListener('load', () => {
          expect(replicaIframe.contentDocument?.location.href).toBe('https://localhost:8080/iframe.html')
          expect(fetchedURL).toBe('https://localhost:8080/iframe.html')
          expect(replicaIframe.contentWindow === replicaIframe.contentDocument?.defaultView).toBe(true)
          expect(`<html>${replicaIframe.contentDocument?.documentElement.innerHTML}</html>`).toBe(
            responseHTML,
          )
          resolve(null)
        })
      })
    })

    it('returns content window for relative URL.', async () => {
      const { primary, replica } = testElement('iframe')
      await new Promise((resolve) => {
        const responseHTML = '<html><head></head><body>Test</body></html>'

        vi.spyOn(BrowserWindow.prototype, 'fetch').mockImplementation(() => {
          return Promise.resolve(<IResponse>(<unknown>{
            text: () => Promise.resolve(responseHTML),
            ok: true,
            headers: new Headers(),
          }))
        })

        window.happyDOM?.setURL('https://localhost:8080')
        replicaWindow.happyDOM?.setURL('https://localhost:8080')

        primary.src = '/iframe.html'
        primary.addEventListener('load', () => {
          expect(replica.contentDocument?.location.href).toBe('https://localhost:8080/iframe.html')
          resolve(null)
        })
      })
    })
  })

  describe('get contentDocument()', () => {
    it('returns content document for "about:blank".', () => {
      const newIframe = document.createElement('iframe') as IHTMLIFrameElement
      newIframe.src = 'about:blank'

      document.body.appendChild(newIframe)
      const replicaIframe = replicaDocument.body.children[0] as IHTMLIFrameElement
      expect(replicaIframe.contentDocument?.documentElement.innerHTML).toBe('<head></head><body></body>')
    })
  })
})
