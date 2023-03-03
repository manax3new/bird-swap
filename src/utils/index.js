import { getAddress } from '@ethersproject/address'
import { Percent, JSBI, ETHER } from '@pancakeswap/sdk'
import { toRaw } from 'vue'

export const isAddress = (value) => {
	try {
		return getAddress(value)
	} catch {
		return false
	}
}

export function basisPointsToPercent(num) {
	return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export const addTokenToMetamask = (token) => {
	return window.ethereum.request({
		method: 'wallet_watchAsset',
		params: {
			type: 'ERC20',
			options: {
				address: token.address,
				symbol: token.symbol,
				decimals: token.decimals,
				image: (token.logoURI) ? token.logoURI : undefined,
			},
		},
	})
}

export const getCurrencyAddress = (currency) => {
	if(!currency) {
		return ''
	}
	if(toRaw(currency) === ETHER) {
		return 'BNB'
	}
	return currency.address
}