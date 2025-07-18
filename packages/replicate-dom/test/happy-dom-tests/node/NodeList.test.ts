/*
  This file is derived from:
  https://github.com/capricorn86/happy-dom/blob/6cbcc10a1a227b36e38a7bc33203b2ae029cca95/packages/happy-dom/test/nodes/node/NodeList.test.ts ,
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

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Window } from 'happy-dom'
import type { Document, Window } from 'happy-dom'
import { initTestReplicaDom } from '../../test-setup'
import { serializeDomNode } from '../../../src'

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

afterEach(() => {
  expect(replicaDocument.body.outerHTML).toBe(document.body.outerHTML)

  const primarySerialized = serializeDomNode(document.body, window)
  const replicaSerialized = serializeDomNode(replicaDocument.body, replicaWindow)
  expect(replicaSerialized).toEqual(primarySerialized)
})

describe('nodeList', () => {
  describe('item()', () => {
    it('returns node at index.', () => {
      const text = document.createTextNode('test')
      const comment = document.createComment('test')
      document.body.appendChild(text)
      document.body.appendChild(comment)
      expect(document.body.childNodes.item(0) === text).toBe(true)
      expect(document.body.childNodes.item(1) === comment).toBe(true)

      expect(replicaDocument.body.childNodes.item(0).nodeType).toBe(text.nodeType)
      expect(replicaDocument.body.childNodes.item(1).nodeType).toBe(comment.nodeType)
    })
  })
})
