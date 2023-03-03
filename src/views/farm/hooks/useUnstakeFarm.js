import { useMasterChef } from '@/use/Contract'
import { unstakeFarm } from '@/utils/calls/farms'

const useUnstakeFarm = (pid) => {

    const masterChefContract = useMasterChef()

    const handleUnstake = async (amount) => {
        return unstakeFarm(masterChefContract, pid, amount)
    }

    return { onUnstake: handleUnstake }
}
export default useUnstakeFarm