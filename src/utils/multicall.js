import { Interface } from '@ethersproject/abi'
import { getMulticallContract } from '@/utils/contractHelpers'

export const multicall = async (abi, calls) => {
    
    const multi = getMulticallContract()
    const itf = new Interface(abi)

    const calldata = calls.map((call) => ({
        target: call.address.toLowerCase(),
        callData: itf.encodeFunctionData(call.name, call.params),
    }))
    const { returnData } = await multi.aggregate(calldata)

    const res = returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call))

    return res
}

export const multicallv2 = async (abi, calls, options) => {

    const { requireSuccess = true, ...overrides } = options || {}
    const multi = getMulticallContract()

    const itf = new Interface(abi)
  
    const calldata = calls.map((call) => ({
        target: call.address.toLowerCase(),
        callData: itf.encodeFunctionData(call.name, call.params),
    }))
  
    const returnData = await multi.tryAggregate(requireSuccess, calldata, overrides)
    const res = returnData.map((call, i) => {
        const [result, data] = call
        return result ? itf.decodeFunctionResult(calls[i].name, data) : null
    })
  
    return res
}