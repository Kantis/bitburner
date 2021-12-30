import { BitBurner as NS, StockSymbol } from "Bitburner"

var shortingEnabled = true
const purchasingEnabled = true
const minimumTransactionValue = 100_000_000
const buyShareThreshold = 0.6
const sellOwnedSharesThreshold = 0.53
const shortShareThreshold = 0.35
const sellShortPositionThreshold = 0.42
const commission = 100_000

/** @param {NS} ns **/
export async function main(ns: NS) {

    interface Stock {
        ticker: StockSymbol
        forecast: number
    }

	function purchasableShares(ticker: StockSymbol) {
		const availableMoney = ns.getServerMoneyAvailable('home') * 0.5
		const [ownedShares] = ns.stock.getPosition(ticker)
		const availableShares = ns.stock.getMaxShares(ticker) - ownedShares
		const stockPrice = ns.stock.getAskPrice(ticker)

		const purchasableShares = Math.min(availableShares, availableMoney / stockPrice)
		
		if (purchasableShares * stockPrice < minimumTransactionValue) {
			return 0
		} else {
			return purchasableShares
		}
	}

	function shortableShares(ticker: StockSymbol) {
		const availableMoney = ns.getServerMoneyAvailable('home')
		const shortedShares = ns.stock.getPosition(ticker)[2]
		const availableShares = ns.stock.getMaxShares(ticker) - shortedShares
		const stockPrice = ns.stock.getAskPrice(ticker)

		const purchasableShares = Math.min(availableShares, availableMoney / stockPrice)
		
		if (purchasableShares * stockPrice < minimumTransactionValue) {
			return 0
		} else {
			return purchasableShares
		}
	}

	function decorateWithForecast(ticker: StockSymbol): Stock {
		return {
			ticker: ticker,
			forecast: ns.stock.getForecast(ticker)
		}
	}

	function purchaseGoodStock(stocks: Stock[]) {
		stocks.filter(s => s.forecast > buyShareThreshold).forEach(s => {
			const sharesToBuy = purchasableShares(s.ticker)
			if (sharesToBuy == 0) return
			ns.print(ns.sprintf('Buying %d stocks in %s. Forecast [%4.2f]', sharesToBuy, s.ticker, s.forecast * 100))
			if (purchasingEnabled) {
				ns.stock.buy(s.ticker, sharesToBuy)
			} else {
				ns.print('Skipping buy since purchasing is disabled')
			}
		})
	}

	function sellPoorOwnedStock(stocks: Stock[]) {
		stocks.filter(s => s.forecast < sellOwnedSharesThreshold)
			.forEach(s => {
				const [ownedShares, avgPrice] = ns.stock.getPosition(s.ticker)
				if (ownedShares > 0) {
					const profit = ownedShares * (ns.stock.getBidPrice(s.ticker) - avgPrice) - commission * 2
					ns.print(ns.sprintf('Selling %d shares in %s. Forecast [%4.2f]. Profit after commissions: $%dM', ownedShares, s.ticker, s.forecast * 100, profit / 1_000_000))
					ns.stock.sell(s.ticker, ownedShares)
				}
			})
	}

	function shortPoorStock(stocks: Stock[]) {
		if (ns.getOwnedSourceFiles().some(s => s.n == 8 && s.lvl > 1)) {
			stocks.filter(s => s.forecast < 0.35)
				.forEach(s => {
					const sharesToShort = shortableShares(s.ticker)
					if (sharesToShort == 0) return
					ns.print(ns.sprintf('Shorting %d stocks in %s. Forecast [%4.2f]', sharesToShort, s.ticker, s.forecast * 100))
					if (shortingEnabled) {
						ns.stock.short(s.ticker, sharesToShort)
					} else {
						ns.print('Skipped shorting since shorting is disabled')
					}
				})
		} else {
			ns.print('Skipping shortPoorStock since required Source-File (8-2) was not found')
		}
	}

	ns.enableLog('ALL')

	if (!(ns.getOwnedSourceFiles().some(s => s.n == 8 && s.lvl > 1))) {
		ns.print('Disabling shorting since required Source-File (8-2) was not found')
		shortingEnabled = false
	}

	while (true) {
		const sortedStocks = ns.stock.getSymbols().map(decorateWithForecast).sort((a: Stock, b: Stock) => b.forecast - a.forecast)
	
		purchaseGoodStock(sortedStocks)
		sellPoorOwnedStock(sortedStocks)
		
		if (shortingEnabled) {
			shortPoorStock(sortedStocks)
		}

		await ns.sleep(10000)
	}
}