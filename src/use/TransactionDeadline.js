import useCurrentBlockTimestamp from "@/use/CurrentBlockTimestamp"
import { BigNumber } from '@ethersproject/bignumber'
import store from '@/store'

export default async function() {
    const ttl = parseInt(store.state.userDeadline) * 60 // 20 minutes
    const blockTimestamp = await useCurrentBlockTimestamp()
    return blockTimestamp.add(BigNumber.from(ttl.toString()))
}