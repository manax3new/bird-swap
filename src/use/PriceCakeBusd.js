import BigNumber from 'bignumber.js'
import { selectCakeFarm, deserializeFarm } from '@/state/farms/hook'

export default () => {
    const cakeBnbFarm = selectCakeFarm()
    if(!cakeBnbFarm) {
        return null
    }
    const deserializedCakeBnbFarm = deserializeFarm(cakeBnbFarm)
    const cakePriceBusdAsString = deserializedCakeBnbFarm.tokenPriceBusd
    return new BigNumber(cakePriceBusdAsString)
}