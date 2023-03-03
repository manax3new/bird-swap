import store from '@/store'
import { ChainId } from '@pancakeswap/sdk'
import { GAS_PRICE_GWEI } from '@/state/types'
import { computed } from 'vue'
import useWeb3Connect from '@/use/Web3Connect'

const Web3Connect = useWeb3Connect()
const chainId = Web3Connect.chainId

export function useUserSlippageTolerance() {
    const userSlippageTolerance = computed(() => {
        return store.state.userSlippageTolerance
    })
    const setUserSlippageTolerance = (value) => {
        store.commit('updateUserSlippageTolerance', value)
    }
    return [
        userSlippageTolerance,
        setUserSlippageTolerance,
    ]
}

export function useGasPrice() {
    const userGas = store.state.userGasPrice
    return chainId.value === ChainId.MAINNET ? userGas : GAS_PRICE_GWEI.testnet
}