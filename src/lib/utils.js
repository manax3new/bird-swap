import { BigNumber } from '@ethersproject/bignumber'
import { JSBI, ETHER } from '@pancakeswap/sdk'
import { BIPS_BASE } from '@/constant/Exchange'
import useWeb3Connect from '@/use/Web3Connect'
import { BLOCK_EXPLORER_BASE_URL } from '@/constant/config/Env.js'
import { toRaw } from 'vue'
import numeral from 'numeral'

export const calculateGasMargin = (value) => {
    return BigNumber.from(value).mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

export function calculateSlippageAmount(value, slippage) {
    if (slippage < 0 || slippage > 10000) {
      throw Error(`Unexpected slippage value: ${slippage}`)
    }
    return [
      JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), BIPS_BASE),
      JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), BIPS_BASE),
    ]
}

export function allowedSlippagePercentFormat(raw) {
    return parseFloat(raw) / 100
}

export const poolTokenPercentageFormat = (percent, significant = 6) => {
	try {
		if(percent === null) {
			return '0'
		}
		const percentFloat = parseFloat(percent.toSignificant(significant))
		if(percentFloat === 0) {
			return '0'
		}
		if(percentFloat < 0.01) {
			return '<0.01'
		} else {
			return numberFormat(percentFloat)
		}
	} catch(error) {
		return '0'
	}
}

export const tokenBalanceFormat = (balance, significant = 6) => {
	try {
		if(balance === null) {
			return '0'
		}
		const balanceFloat = parseFloat(balance.toSignificant(significant))
		if(balanceFloat === 0) {
			return '0'
		}
		return balance.toSignificant(significant)
	} catch(error) {
		return '0'
	}
}

export const numberFormat = (raw, digit = 2) => {
	try {
		if(raw === null) {
			return 0
		}
		return parseFloat(raw).toFixed(digit)
	} catch(error) {
		return 0
	}
}

export const numeralNumberFormat = (raw, digit = 2) => {
	try {

		const formatCalculate = () => {
			let formatStr = '0,0'
			if(digit === 0) {
				return formatStr
			}
			formatStr += '.'
			for(let i = 0;i < digit;i++) {
				formatStr += '0'
			}
			return formatStr
		}

		const floatNumber = parseFloat(raw)
		if(isNaN(floatNumber)) {
			return '0.00'
		}
		const formatStr = formatCalculate()
		const formatedNumber = numeral(floatNumber).format(formatStr)
		return formatedNumber
	} catch (error) {
		return '0.00'
	}
}

export const bnbBalanceFormat = (raw, digit = 2) => {
	try {
		const Web3Connect = useWeb3Connect()
        const web3 = Web3Connect.getWeb3()
		const rawString = web3.utils.fromWei(raw.toString())
		return numberFormat(rawString, digit)
	} catch(error) {
		return 0
	}
}

export const viewTransactionOnBscUrl = (address) => {
	const Web3Connect = useWeb3Connect()
	const chainId = Web3Connect.chainId
	return `${BLOCK_EXPLORER_BASE_URL[chainId.value]}/tx/${address}`
}

export const viewAddressOnBscUrl = (address) => {
	const Web3Connect = useWeb3Connect()
	const chainId = Web3Connect.chainId
	return `${BLOCK_EXPLORER_BASE_URL[chainId.value]}/address/${address}`
}

export const viewCountdownOnBscUrl = (address) => {
	const Web3Connect = useWeb3Connect()
	const chainId = Web3Connect.chainId
	return `${BLOCK_EXPLORER_BASE_URL[chainId.value]}/block/countdown/${address}`
}

export const isEther = (token) => {
	return toRaw(token) === ETHER
}