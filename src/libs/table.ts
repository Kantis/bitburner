import { joinToString, pad, repeat, TextAlignment } from "/libs/std.js";

interface Column<T> {
    label: string,
    width: number,
    extractor: (item: T) => string,
    headerAlignment?: TextAlignment,
    alignment?: TextAlignment,
}

export function printTable<T>(
    items: T[],
    columns: Column<T>[],
    printFn: (s: string) => void,
) {
    function printBorder() {
        printFn(joinToString(columns, { prefix: '+', suffix: '+', delimiter: '+'}, (c) => repeat('-', c.width)))
    }

    function printHeader() {
        printFn(joinToString(columns, { prefix: '|', suffix: '|', delimiter: '|' }, c => pad(c.label, c.width, {align: c.headerAlignment ?? 'Center'})))
    }

    function printItem(t: T) {
        printFn(joinToString(columns, { prefix: '|', suffix: '|', delimiter: '|' }, c => pad(c.extractor(t), c.width, {align: c.alignment ?? 'Right'})))
    }

    printBorder()
    printHeader()
    printBorder()
    items.forEach(printItem)
    printBorder()
}