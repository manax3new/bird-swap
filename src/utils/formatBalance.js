import BigNumber from 'bignumber.js'
import { BIG_TEN } from '@/utils/bigNumber'
import { formatUnits } from '@ethersproject/units'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'

export const getFullDisplayBalance = (balance, decimals = 18, displayDecimals) => {
    return getBalanceAmount(balance, decimals).toFixed(displayDecimals)
}

export const getBalanceAmount = (amount, decimals = 18) => {
    return new BigNumber(amount).dividedBy(BIG_TEN.pow(decimals))
}

export const getBalanceNumber = (balance, decimals = 18) => {
    return getBalanceAmount(balance, decimals).toNumber()
}

export const formatBigNumber = (number, displayDecimals = 18, decimals = 18) => {
    const remainder = number.mod(EthersBigNumber.from(10).pow(decimals - displayDecimals))
    return formatUnits(number.sub(remainder), decimals)
}

export const formatNumber = (number, minPrecision = 2, maxPrecision = 2) => {
    const options = {
        minimumFractionDigits: minPrecision,
        maximumFractionDigits: maxPrecision,
    }
    return number.toLocaleString(undefined, options)
}

export const getDecimalAmount = (amount, decimals = 18) => {
    return new BigNumber(amount).times(BIG_TEN.pow(decimals))
}

export const tokenBalanceFormat = (amount, decimals = 18, displayDecimals = 2) => {
    return parseFloat(formatUnits(amount, decimals)).toFixed(displayDecimals)
}