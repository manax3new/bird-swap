import BigNumber from 'bignumber.js'
import { DEFAULT_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL } from '@/constant/config'
import { useGasPrice } from '@/state/user/hook'

const options = {
    gasLimit: DEFAULT_GAS_LIMIT,
}

export const stakeFarm = async (masterChefContract, pid, amount) => {
    const gasPrice = useGasPrice()
    const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
    if (pid === 0) {
        return masterChefContract.enterStaking(value, { ...options, gasPrice })
    }

    return masterChefContract.deposit(pid, value, { ...options, gasPrice })
}

export const unstakeFarm = async (masterChefContract, pid, amount) => {
    const gasPrice = useGasPrice()
    const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
    if (pid === 0) {
        return masterChefContract.leaveStaking(value, { ...options, gasPrice })
    }

    return masterChefContract.withdraw(pid, value, { ...options, gasPrice })
}

export const harvestFarm = async (masterChefContract, pid) => {
    const gasPrice = useGasPrice()
    if (pid === 0) {
        return masterChefContract.leaveStaking('0', { ...options, gasPrice })
    }

    return masterChefContract.deposit(pid, '0', { ...options, gasPrice })
}
