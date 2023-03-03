import { Token, Pair } from '@pancakeswap/sdk'
import IPairABI from '@/constant/abi/IPair.json'
import useParseSdkEntity from '@/use/ParseSdkEntity.js'
import PAIR_STATE from '@/constant/PairState'
import useWeb3Connect from '@/use/Web3Connect'

export default (context) => {

    const Web3Connect = useWeb3Connect()
    const web3 = Web3Connect.getWeb3()

    const ParseSdkEntity = useParseSdkEntity(web3)

    const getReserve = async (pairAddress) => {
        try {
            const pairContract = new web3.eth.Contract(IPairABI, pairAddress)
            const { reserve0, reserve1 } = await pairContract.methods.getReserves().call()
            return {
                reserve0, reserve1
            }
        } catch (error) {
            console.log('Pair.getReserve error', error.message)
            return null
        }
    }

    const getPair = async (rawTokenA, rawTokenB) => {

        try {

            let tokenA
            let tokenB

            if(!rawTokenA || !rawTokenB) {
                return [
                    PAIR_STATE.INVALID,
                    null
                ]
            }

            if(rawTokenA instanceof Token) {
                tokenA = rawTokenA
            } else {
                tokenA = new Token(rawTokenA.chainId, rawTokenA.address, rawTokenA.decimals, rawTokenA.symbol, rawTokenA.name)
            }
            if(rawTokenB instanceof Token) {
                tokenB = rawTokenB
            } else {
                tokenB = new Token(rawTokenB.chainId, rawTokenB.address, rawTokenB.decimals, rawTokenB.symbol, rawTokenB.name)
            }

            const pairAddress = Pair.getAddress(tokenA, tokenB)

            const reserves = await getReserve(pairAddress)

            if(!reserves) {
                return [
                    PAIR_STATE.NOT_EXISTS,
                    pair
                ]
            }
            if(tokenA.equals(tokenB)) {
                return [
                    PAIR_STATE.INVALID,
                    null
                ]
            }

            const { reserve0, reserve1 } = reserves
            const pair = ParseSdkEntity.createPair(tokenA, tokenB, reserve0, reserve1)
            return [
                PAIR_STATE.EXISTS,
                pair
            ]

        } catch (error) {
            console.log('Pair.getPair error', error.message)
            return [
                PAIR_STATE.INVALID,
                null,
            ]
        }
    }

    return {
        getReserve,
        getPair,
        context,
    }
}