import { useMasterChef } from '@/use/Contract'
import { stakeFarm } from '@/utils/calls/farms'

const useStakeFarm = (pid) => {

    const masterChefContract = useMasterChef()

    const handleStake = async (amount) => {
        return stakeFarm(masterChefContract, pid, amount)
    }

    return { onStake: handleStake }
}
export default useStakeFarm