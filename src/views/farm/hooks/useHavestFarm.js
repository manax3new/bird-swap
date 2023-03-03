import { useMasterChef } from '@/use/Contract'
import { harvestFarm } from '@/utils/calls/farms'

const useHarvestFarm = (pid) => {

    const masterChefContract = useMasterChef()

    const handleHarvest = async () => {
        return harvestFarm(masterChefContract, pid)
    }

    return { onReward: handleHarvest }
}
export default useHarvestFarm