import { maximumSubsum } from '../src/cct/subsum'

test('max subsum', () => {
    expect(maximumSubsum([10, -1, 2])).toBe(11)
    expect(maximumSubsum([-8,0,3,-9,-5,-1,2,7,8,-4,-7,7,8,-8,-9,3,9,6,-10,0,-2,10,8,1,3,-3,-2,10,8,-1,-10,-5,-6,-10,5,10,1,-7,-3])).toBe(45)
})