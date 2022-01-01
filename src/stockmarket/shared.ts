import { BitBurner, StockSymbol } from "Bitburner"
import { add } from "/libs/std.js"


export interface StockPosition {
    ticker: StockSymbol
    owned: number
    avgPrice: number
    sharesShort: number
    avgPriceShort: number
    currentValue: number
    profit: number
    profitPercent: number
    forecast: number
}

export function getPosition(ns: BitBurner, symbol: StockSymbol): StockPosition {
    const [owned, avgPrice, sharesShort, avgPriceShort] = ns.stock.getPosition(symbol)

    const currentValue = owned * ns.stock.getBidPrice(symbol)
    const profit = currentValue - owned * avgPrice
    const profitPercent = profit / (owned * avgPrice)

    return {
        ticker: symbol,
        owned: owned,
        avgPrice: avgPrice,
        sharesShort: sharesShort,
        avgPriceShort: avgPriceShort,
        currentValue: currentValue,
        profit: profit,
        profitPercent: profitPercent,
        forecast: ns.stock.getForecast(symbol)
    }
}

export function liquidateAll(ns: BitBurner) {
    const getStockPosition = (s: StockSymbol) => getPosition(ns, s)

    const liquidated = ns.stock.getSymbols()
        .map(getStockPosition)
        .map(p => ns.stock.sell(p.ticker, p.owned) * p.owned)
        .reduce(add)

    ns.tprintf('Liquidated total: %s', ns.nFormat(liquidated, '0.00a'))
}

export function stopAutoTrader(ns: BitBurner) {
    const killedPids = ns.ps('home').filter(p => p.filename == '/stockmarket/autotrader.js').map(p => ns.kill(p.pid))
    if (killedPids.some(b => b == true)) {
        ns.tprintf('Stopped stock autotrader')
    } else {
        ns.tprintf('Failed to kill autotrader, was it running?')
    }
}

export function printOwnedStock(ns: BitBurner, printFn: (s: string) => void) {

    const symbols = ns.stock.getSymbols()
    const portfolio = symbols
        .map(s => getPosition(ns, s))
        .filter(pos => pos.owned > 0)

    printFn('+-----------------------+-----------+-----------+--------------------+')
    printFn('|   Name                | Forecast  |   Value   |       Profit       |')
    printFn('+-----------------------+-----------+-----------+--------------------+')

    portfolio
        .forEach(s => {
            printFn(ns.sprintf(
                '| %-21s | %8.2f%% | %9s | %8s (%6.2f%%) |',
                s.ticker,
                s.forecast * 100,
                ns.nFormat(s.currentValue, '0.00a'),
                ns.nFormat(s.profit, '0.00a'),
                s.profitPercent * 100
            ))
        })
    printFn('+-----------------------+-----------+-----------+--------------------+')
}