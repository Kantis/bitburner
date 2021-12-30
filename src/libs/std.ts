/** @param {NS} ns **/
export function range(endExclusive: number): number[] {
	if (endExclusive == 0) return []
	return [...Array(Math.floor(endExclusive)).keys()]
}

export function uniq<T>(a: T[]): T[] {
	var result = Array<T>()

	a.forEach(function (item) {
		if (result.indexOf(item) < 0) {
			result.push(item)
		}
	})

	return result
}

type NumberSuffixes = 'M' | 'm' | 'B' | 'b' | 'T' | 't' | 'Q' | 'q'
type ShorthandNumber = `${number}${NumberSuffixes}`
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