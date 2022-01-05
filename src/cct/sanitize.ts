export function sanitizeParentheses(input: string): string[] {
    // const startIndexes = [...input].map((c, i) => c == '(' ? i : -1).filter(i => i > -1)
    // const endIndexes = [...input].map((c, i) => c == ')' ? i : -1).filter(i => i > -1)

    const stack: string[] = []
    for (const c of input) {
        switch (c) {
            case ')': stack.pop()
        }
    }

    return []
}

function isValid(input: string): boolean {
    return true
}