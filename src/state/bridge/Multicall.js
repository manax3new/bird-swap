import { Interface } from '@ethersproject/abi'
import { getMulticallContract } from '@/state/bridge/Contract'

export const multicall = async (chainId, abi, calls) => {
    
    const multi = getMulticallContract(chainId)
    const itf = new Interface(abi)

    const calldata = calls.map((call) => ({
        target: call.address.toLowerCase(),
        callData: itf.encodeFunctionData(call.name, call.params),
    }))
    const { returnData } = await multi.aggregate(calldata)

    const res = returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call))

    return res
}