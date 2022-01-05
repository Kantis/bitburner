import { notStrictEqual } from "assert"

/** @param {NS} ns **/
export function range(startInclusive: number = 0, endExclusive: number): number[] {
	if (endExclusive == 0) return []
	return [...Array(Math.floor(endExclusive)).keys()].slice(startInclusive)
}

function arrayContentEquals(a: any[], b: any[]): boolean {
	return a.every((val, index) => val == b[index])
}

export function uniq<T>(a: T[]): T[] {
	var result = Array<T>()

	if (Array.isArray(a[0])) {
		a.forEach(innerArr => {
			// @ts-ignore
			if (!result.some(otherArr => arrayContentEquals(innerArr, otherArr))) {
				result.push(innerArr)
			}
		})
	} else {
		a.forEach(item => {
			if (result.indexOf(item) < 0) {
				result.push(item)
			}
		})
	}

	return result
}

export type NumberSuffixes = 'M' | 'm' | 'B' | 'b' | 'T' | 't' | 'Q' | 'q'
export type ShorthandNumber = `${number}${NumberSuffixes}`
export function parseNumber(shorthandNumber: ShorthandNumber) {
	const num = parseFloat(shorthandNumber.slice(0, -1))
	switch (shorthandNumber.slice(-1)) {
		case 'm':
		case 'M': return num * 1e6

		case 'b':
		case 'B': return num * 1e9

		case 't':
		case 'T': return num * 1e12

		case 'q':
		case 'Q': return num * 1e15

		default: throw new Error('Invalid shorthanded number: ' + shorthandNumber)
	}
}

export function associateBy<K, V>(arr: V[], keySelector: (v: V) => K) {
	const result = new Map<K, V>()
	arr.forEach(item => result.set(keySelector(item), item))
	return result
}

export function associateWith<K, V>(arr: K[], valueSelector: (k: K) => V) {
	const result = new Map<K, V>()
	arr.forEach(item => result.set(item, valueSelector(item)))
	return result
}

export function add(a: number, b: number) {
	return a + b
}


interface JoinToStringOptions {
	prefix?: string
	suffix?: string
	delimiter?: string
}

export function joinToString<T>(
	items: T[],
	{ prefix = '', suffix = '', delimiter = ', ' }: JoinToStringOptions,
	mapper: (item: T) => string
): string {
	if (items.length == 0) return prefix + suffix
	if (items.length == 1) return prefix + mapper(items[0]) + suffix
	return prefix + mapper(items[0]) + items.slice(1).map(item => delimiter + mapper(item)).reduce((a, b) => a + b) + suffix
}

export function repeat(s: string, times: number): string {
	return joinToString(range(0, times).map(_ => s), { delimiter: '' }, i => i)
}

export type TextAlignment = 'Left' | 'Right' | 'Center'

interface PadStringOptions {
	align?: TextAlignment
	padLeft?: number
	padRight?: number
}

export function pad(s: string, width: number, { align = 'Left', padLeft = 1, padRight = 1 }: PadStringOptions) {
	const toPad = width - s.length

	if (align == 'Center') {
		return repeat(' ', Math.floor(toPad / 2)) + s + repeat(' ', Math.ceil(toPad / 2))
	}

	const leftPad = align == 'Left' ? padLeft : toPad - padRight
	const rightPad = align == 'Right' ? padRight : toPad - padLeft

	return repeat(' ', leftPad) + s + repeat(' ', rightPad)
}

export function firstOrNull<T>(ts: T[], predicate: (t: T) => boolean): (T | undefined) {
	for (const t of ts) {
		if (predicate(t)) return t
	}
	return undefined
}

export function nextSecond(millis: number): number {
	return millis + (1000 - millis % 1000)
}