/* eslint-disable @typescript-eslint/no-explicit-any */
import { VFile } from 'vfile'
import { describe, expect, it } from 'vitest'

import { directiveTransformer } from '../../src/transformers/directive'

describe('directive script', () => {
	it('should return data from directive', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: `<!--
background-color: "#e5e5f7"
"opacity": 0.8
-->`
				},
				{
					type: 'html',
					value: `<!--
"opacity": 0.9
"background-image": "radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px)"
"background-size": 10px 10px
-->`
				},
				{
					type: 'html',
					value: '<div></div>'
				}
			],
			data: {
				hProperties: {}
			}
		}
		const vfile = new VFile()

		const transformer = directiveTransformer()
		transformer(tree, vfile, null as any)

		expect(tree.children.length).toEqual(1)
		expect(vfile.data).toEqual({
			local: {
				'background-color': '#e5e5f7',
				opacity: 0.9,
				'background-image': 'radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px)',
				'background-size': '10px 10px'
			}
		})
	})

	it('should return data from advance directive', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: `<!--
background-color: red
background-image: img
transition:in: fade
"use:clickoutside": "{data.value}"
-->`
				},
				{
					type: 'html',
					value: '<div></div>'
				}
			],
			data: {
				hProperties: {}
			}
		}
		const vfile = new VFile()

		const transformer = directiveTransformer()
		transformer(tree, vfile, null as any)

		expect(tree.children.length).toEqual(1)
		expect(vfile.data).toEqual({
			local: {
				'background-color': 'red',
				'background-image': 'img',
				'transition:in': 'fade',
				'use:clickoutside': '{data.value}'
			}
		})
	})

	it('should return empty when with out parent', () => {
		const tree = {
			type: 'html',
			value: `<!--
background-color: red
background-image: img
"transition:in": fade
"use:clickoutside": "{data.value}"
-->`
		}
		const vfile = new VFile()

		const transformer = directiveTransformer()
		transformer(tree, vfile, null as any)

		expect(vfile.data).toEqual({})
	})

	it('should return empty when invalid syntax', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: `<!--
background-color: red
	background-image: img
"transition:in": fade
"use:clickoutside": "{data.value}"
-->`
				},
				{
					type: 'html',
					value: '<div></div>'
				}
			],
			data: {
				hProperties: {}
			}
		}
		const vfile = new VFile()

		const transformer = directiveTransformer()
		transformer(tree, vfile, null as any)

		expect(vfile.data).toEqual({})
	})

	it('should return data from global directive', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: `<!--global
background-color: "#e5e5f7"
"opacity": 0.8
-->`
				},
				{
					type: 'html',
					value: `<!--global
"opacity": 0.9
"background-image": "radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px)"
"background-size": 10px 10px
-->`
				},
				{
					type: 'html',
					value: '<div></div>'
				}
			],
			data: {
				hProperties: {}
			}
		}
		const vfile = new VFile()

		const transformer = directiveTransformer()
		transformer(tree, vfile, null as any)

		expect(tree.children.length).toEqual(1)
		expect(vfile.data).toEqual({
			global: {
				'background-color': '#e5e5f7',
				opacity: 0.9,
				'background-image': 'radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px)',
				'background-size': '10px 10px'
			}
		})
	})
})
