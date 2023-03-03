import { BigNumber } from '@ethersproject/bignumber'
import useWeb3Connect from '@/use/Web3Connect'

export default async function() {

    const Web3Connect = useWeb3Connect()
    const web3 = Web3Connect.getWeb3()

    let blockTimestamp
    
    if(process.env.NODE_ENV === 'development') {
        blockTimestamp = new Date().valueOf().toString()
    } else {
        const blockNumber = await web3.eth.getBlockNumber()
        const block = await web3.eth.getBlock(blockNumber)
        blockTimestamp = block.timestamp.toString()
    }
    return BigNumber.from(blockTimestamp)
}