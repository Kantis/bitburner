import { sanitizeParentheses } from '../src/cct/sanitize'
// test('examples', () => {
//     expect(sanitizeParentheses("()())()")).toStrictEqual(['()()()', '(())()'])
//     expect(sanitizeParentheses("(a)())()" )).toStrictEqual(['(a)()()', '(a())()'])
//     expect(sanitizeParentheses(')(')).toStrictEqual([])
// })