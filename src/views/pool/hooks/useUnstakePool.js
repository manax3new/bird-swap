import { parseUnits } from '@ethersproject/units'
import { unstakeFarm } from '@/utils/calls'
import { useMasterChef, useSousChef } from '@/use/Contract'
import { useGasPrice } from '@/state/user/hook'

const sousUnstake = (sousChefContract, amount, decimals) => {
    const gasPrice = useGasPrice()
    const units = parseUnits(amount, decimals)

    return sousChefContract.withdraw(units.toString(), {
        gasPrice,
    })
}

const sousEmergencyUnstake = (sousChefContract) => {
    const gasPrice = useGasPrice()
    return sousChefContract.emergencyWithdraw({ gasPrice })
}

const useUnstakePool = (sousId, enableEmergencyWithdraw = false) => {
    const masterChefContract = useMasterChef()
    const sousChefContract = useSousChef(sousId)
    
    const handleUnstake = async (amount, decimals) => {
        if (sousId === 0) {
            return unstakeFarm(masterChefContract, 0, amount)
        }
        if (enableEmergencyWithdraw) {
            return sousEmergencyUnstake(sousChefContract)
        }

        return sousUnstake(sousChefContract, amount, decimals)
    }

    return { onUnstake: handleUnstake }
}

export default useUnstakePool
