import { harvestFarm } from '@/utils/calls/farms'
import { BIG_ZERO } from '@/utils/bigNumber'
import { useGasPrice } from '@/state/user/hook'
import { useMasterChef, useSousChef } from '@/use/Contract'
import { DEFAULT_GAS_LIMIT } from '@/constant/config'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const harvestPool = async (sousChefContract) => {
    const gasPrice = useGasPrice()
    return sousChefContract.deposit('0', { ...options, gasPrice })
}

const harvestPoolBnb = async (sousChefContract) => {
    const gasPrice = useGasPrice()
    return sousChefContract.deposit({ ...options, value: BIG_ZERO, gasPrice })
}

const useHarvestPool = (sousId, isUsingBnb = false) => {

    const sousChefContract = useSousChef(sousId)
    const masterChefContract = useMasterChef()

    const handleHarvest = async () => {
        if (sousId === 0) {
            return harvestFarm(masterChefContract, 0)
        }
        if (isUsingBnb) {
            return harvestPoolBnb(sousChefContract)
        }
        return harvestPool(sousChefContract)
    }

    return { onReward: handleHarvest }
}

export default useHarvestPool
