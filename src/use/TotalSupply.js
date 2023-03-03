import { TokenAmount } from '@pancakeswap/sdk'
import useERC20 from '@/use/ERC20.js'
import useWeb3Connect from '@/use/Web3Connect'

export default async (token) => {

    const Web3Connect = useWeb3Connect()
    const web3 = Web3Connect.getWeb3()
    const ERC20 = useERC20(web3)

    const rawTotalSupply = await ERC20.totalSupply(token.address)
    return new TokenAmount(token, rawTotalSupply.toString())
}