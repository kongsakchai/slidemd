/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import { directiveTransformer, parseYAML } from '../../src/transformers/directive'
import { buildVFile, slideOf } from './helper'

describe('directive script', () => {
	it('should merge local directives into the current slide', () => {
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
				{ type: 'html', value: '<div></div>' }
			]
		}
		const vfile = buildVFile()

		directiveTransformer()(tree, vfile, null as any)

		expect(tree.children.length).toEqual(1)
		expect(slideOf(vfile).local).toEqual({
			'background-color': '#e5e5f7',
			opacity: 0.9,
			'background-image': 'radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px)',
			'background-size': '10px 10px'
		})
	})

	it('should support svelte-style directive keys', () => {
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
				{ type: 'html', value: '<div></div>' }
			]
		}
		const vfile = buildVFile()

		directiveTransformer()(tree, vfile, null as any)

		expect(tree.children.length).toEqual(1)
		expect(slideOf(vfile).local).toEqual({
			'background-color': 'red',
			'background-image': 'img',
			'transition:in': 'fade',
			'use:clickoutside': '{data.value}'
		})
	})

	it('should ignore directive when node has no parent', () => {
		const tree = {
			type: 'html',
			value: `<!--
background-color: red
"transition:in": fade
-->`
		}
		const vfile = buildVFile()

		directiveTransformer()(tree, vfile, null as any)

		expect(slideOf(vfile).local).toBeUndefined()
	})

	it('should ignore directive when no slide owns the current index', () => {
		const tree = {
			type: 'root',
			children: [{ type: 'html', value: '<!--\ncolor: red\n-->' }]
		}
		const vfile = buildVFile({ slides: [] })

		directiveTransformer()(tree, vfile, null as any)

		expect(vfile.data.context.slides).toEqual([])
	})

	it('should ignore directive with invalid yaml syntax', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: `<!--
background-color: red
	background-image: img
"transition:in": fade
-->`
				},
				{ type: 'html', value: '<div></div>' }
			]
		}
		const vfile = buildVFile()

		directiveTransformer()(tree, vfile, null as any)

		expect(slideOf(vfile).local).toBeUndefined()
	})

	it('should merge global directives into the slide global data', () => {
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
				{ type: 'html', value: '<div></div>' }
			]
		}
		const vfile = buildVFile()

		directiveTransformer()(tree, vfile, null as any)

		expect(tree.children.length).toEqual(1)
		expect(slideOf(vfile).global).toEqual({
			'background-color': '#e5e5f7',
			opacity: 0.9,
			'background-image': 'radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px)',
			'background-size': '10px 10px'
		})
	})

	it('should attach directive to the slide that owns the current index', () => {
		const tree = {
			type: 'root',
			children: [
				{ type: 'text', value: '---page-break---' },
				{ type: 'html', value: '<!--\ncolor: blue\n-->' }
			]
		}
		const vfile = buildVFile({
			slides: [{ breakIndex: 0 }, { breakIndex: 1 }]
		})

		directiveTransformer()(tree, vfile, null as any)

		expect(slideOf(vfile, 1).local).toEqual({ color: 'blue' })
	})
})

describe('parseYAML', () => {
	it('should parse valid yaml', () => {
		expect(parseYAML('a: 1\nb: hello')).toEqual({ a: 1, b: 'hello' })
	})

	it('should return empty object for invalid yaml', () => {
		expect(parseYAML('a: 1\n\tb: 2')).toEqual({})
	})
})
