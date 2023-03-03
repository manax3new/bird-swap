import { stakeFarm } from '@/utils/calls/farms'
import BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DECIMAL, DEFAULT_GAS_LIMIT } from '@/constant/config'
import { BIG_TEN } from '@/utils/bigNumber'
import { useMasterChef, useSousChef } from '@/use/Contract'
import { useGasPrice } from '@/state/user/hook'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const sousStake = async (sousChefContract, amount, decimals = 18) => {
    const gasPrice = useGasPrice()
    return sousChefContract.deposit(new BigNumber(amount).times(BIG_TEN.pow(decimals)).toString(), {
        ...options,
        gasPrice,
    })
}

const sousStakeBnb = async (sousChefContract, amount) => {
    const gasPrice = useGasPrice()
    return sousChefContract.deposit(new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString(), {
        ...options,
        gasPrice,
    })
}

const useStakePool = (sousId, isUsingBnb = false) => {

    const masterChefContract = useMasterChef()
    const sousChefContract = useSousChef(sousId)

    const handleStake = async (amount, decimals) => {
        if (sousId === 0) {
            return stakeFarm(masterChefContract, 0, amount)
        }
        if (isUsingBnb) {
            return sousStakeBnb(sousChefContract, amount)
        }
        return sousStake(sousChefContract, amount, decimals)
    }

    return { onStake: handleStake }
}

export default useStakePool
