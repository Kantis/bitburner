import { mergeOverlapping } from "../src/cct/merge-overlap";

test('solves example', () => {
    expect(mergeOverlapping([[1, 3], [8, 10], [2, 6], [10, 16]])).toStrictEqual([[1, 6], [8, 16]])
})

test('ingame example', () => {
    expect(mergeOverlapping([[20, 23], [14, 18], [10, 13], [24, 31], [19, 25], [12, 22], [2, 11], [12, 18], [24, 33], [16, 22], [14, 23], [25, 34], [6, 13], [6, 12], [9, 12], [17, 21], [14, 21], [9, 14], [15, 16], [17, 18]])).toStrictEqual([[2, 34]])
})