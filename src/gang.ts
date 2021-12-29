import { BitBurner as NS, GangEquipment, GangEquipmentType, GangName } from 'Bitburner';

const OWN_GANG = 'Slum Snakes'
const ascensionThreshold = 2.0
const toWarThreshold = 0.8

type GangMode = 'TO WAR' | 'BUILD POWER' | 'BUSINESS AS USUAL'

function add(a: any, b: any) { return a + b }

Object.defineProperty(Array.prototype, 'contains', {
	value: function(x: any) { return this.indexOf(x) !== -1 }
})

/** @param {NS} ns **/
export async function main(ns: NS) {
	function checkAscension(memberName: string) {
		let result = ns.gang.getAscensionResult(memberName)

		if (result !== undefined && result.str > ascensionThreshold) {
			ns.gang.ascendMember(memberName)
			ns.gang.setMemberTask(memberName, 'Train Combat')
		}
	}

	function isIncubating(memberName: string) {
		return ns.gang.getMemberInformation(memberName).task == 'Train Combat'
	}

	function otherGangNames(): GangName[] {
		return ['NiteSec', 'Slum Snakes', 'Speakers for the Dead', 'Tetrads', 'The Black Hand', 'The Dark Army', 'The Syndicate']
	}

	function clashWinRate() {
		let uncontrolledTerritory = 1 - ns.gang.getGangInformation().territory
	
		return otherGangNames()
			.filter(g => g != OWN_GANG)
			.filter(g => ns.gang.getOtherGangInformation()[g][0].territory > 0.01)
			.map(g => ns.gang.getChanceToWinClash(g) * (ns.gang.getOtherGangInformation()[g][0].territory / uncontrolledTerritory))
			.reduce(add, 0)
	}

	function shouldPurchaseEquipment(equip: GangEquipment) {
        const typesToPurchase: GangEquipmentType[] = ['Armor', 'Weapon', 'Vehicle']
		return (
				typesToPurchase.indexOf(ns.gang.getEquipmentType(equip)) != -1 && 
				ns.gang.getEquipmentCost(equip) < 0.5 * ns.getServerMoneyAvailable('home')
			)
			|| ns.gang.getEquipmentCost(equip) < 0.005 * ns.getServerMoneyAvailable('home')

	}

	function determineMode(): GangMode {
		const info = ns.gang.getGangInformation()
		const winRate = clashWinRate()

		if (winRate > toWarThreshold && !ns.gang.getGangInformation().territoryWarfareEngaged) {
			// To battle!
			return 'TO WAR'
		} else if (info.territory < 0.5) {
			if (info.territoryClashChance == 0) {
				return 'BUILD POWER'
			} else if (winRate < 0.6) {
				ns.tprint('Disabling territory warfare to prepare for building power')
				ns.gang.setTerritoryWarfare(false)
			} 
		} 

		return 'BUSINESS AS USUAL'
	}


	ns.disableLog('sleep')
	
	while (true) {
		let members = ns.gang.getMemberNames()
		let mode = determineMode()
		ns.print(ns.sprintf('Running in mode [%s], clash win rate: [%4.2f], current territory: [%4.2f]', mode, clashWinRate() * 100, ns.gang.getGangInformation().territory * 100))

		members
			.filter(isIncubating)
			.forEach(checkAscension)

		let nonIncubatingMembers = members.filter(member => !isIncubating(member))

		switch (mode) {
			case 'TO WAR':
				ns.print('Enabling clashes and moving members from Territory Warfare')
				nonIncubatingMembers.forEach(m => ns.gang.setMemberTask(m, 'Human Trafficking'))
				ns.gang.setMemberTask(nonIncubatingMembers[0], 'Vigilante Justice')
				ns.gang.setTerritoryWarfare(true)
				break
			case 'BUILD POWER':
				ns.print('Building power!')
				nonIncubatingMembers
					.filter(m => ns.gang.getMemberInformation(m).task != 'Territory Warfare')
					.forEach(m => ns.gang.setMemberTask(m, 'Territory Warfare'))
				break
			case 'BUSINESS AS USUAL':
				ns.print('Business as usual, doing nothing atm')
				break
		}

		members
			// .filter(member => !incubating(member))
			.forEach(member => {
				let info = ns.gang.getMemberInformation(member)
				
				ns.gang.getEquipmentNames()
					.filter(e => info.upgrades.indexOf(e) == -1)
					.filter(shouldPurchaseEquipment)
					.forEach(e => ns.gang.purchaseEquipment(member, e))
			})

		if (ns.gang.canRecruitMember()) {
			let name = 'g' + (members.length + 1)
			ns.gang.recruitMember(name)
			ns.gang.setMemberTask(name, 'Train Combat')
		}
			
		await ns.sleep(20000)
	}
}