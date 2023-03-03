import useERC20 from '@/use/ERC20'
import { Token, TokenAmount, ETHER, CurrencyAmount } from '@pancakeswap/sdk'

export async function useCurrencyBalances(account, currencies) {

    const tokensFiltered = currencies?.filter((currency) => {
        return currency instanceof Token ?? []
    })
    const tokens = tokensFiltered ? tokensFiltered : []
    const tokenBalances = await useTokenBalances(account.address, tokens)
    const bnbBalance = CurrencyAmount.ether(account.balance.toString())

    return currencies?.map((currency) => {
        if (!account || !currency) return undefined
        if (currency instanceof Token) return tokenBalances[currency.address]
        if (currency === ETHER) return bnbBalance
        return undefined
    }) ?? []
}

export async function useTokenBalances(address, tokens) {

    const ERC20 = useERC20()

    const tasks = []

    for(const token of tokens) {
        tasks.push(ERC20.balanceOf(token.address, address))
    }

    const rawBalances = await Promise.all(tasks)
    const balanceMap = {}
    rawBalances.map((rawBalance, index) => {
        balanceMap[tokens[index].address] = new TokenAmount(tokens[index], rawBalance)
    })
    return balanceMap
}

export async function useCurrencyBalance(account, currency) {
    return (await useCurrencyBalances(account, [currency]))[0]
}