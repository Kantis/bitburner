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