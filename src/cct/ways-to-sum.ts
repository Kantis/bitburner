import { uniq } from "/libs/std.js"


function addOneToEach(input: number[]): number[][] {
    const result: number[][] = []

    for (let i = 0; i < input.length; i++) {
        result.push([...input.slice(0, i), input[i] + 1, ...input.slice(i + 1)])
    }

    return result
}

export function waysToSum(n: number): number {
    return NumberOfways(n, n - 1)
}

function NumberOfways(N: number, K: number) {
    // Initialize a list
    let dp = Array.from({ length: N + 1 }, (_, i) => 0);

    // Update dp[0] to 1
    dp[0] = 1;

    // Iterate over the range [1, K + 1]
    for (let row = 1; row < K + 1; row++) {

        // Iterate over the range [1, N + 1]
        for (let col = 1; col < N + 1; col++) {

            // If col is greater
            // than or equal to row
            if (col >= row)

                // Update current
                // dp[col] state
                dp[col] = dp[col] + dp[col - row];
        }
    }

    // Return the total number of ways
    return (dp[N]);
}


// 6 + 1
// 5 + 2
// 5 + 1 + 1
// 4 + 3
// 4 + 2 + 1
// 4 + 1 + 1 + 1
// 3 + 3 + 1
// 3 + 2 + 2
// 3 + 2 + 1 + 1
// 3 + 1 + 1 + 1 + 1
// 2 + 2 + 2 + 1
// 2 + 2 + 2 + 1 + 1
// 2 + 2 + 1 + 1 + 1 + 1 + 1
// 2 + 1 + 1 + 1 + 1 + 1 + 1 + 1
// 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1

// 0 1 2 3 4 5 6  7
// 0 0 1 2 4 6 10 15
