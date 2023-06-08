import { ChainId } from '@pancakeswap/sdk'

export const CHAIN_ID = parseInt(process.env.VUE_APP_CHAIN_ID)
export const chainId = CHAIN_ID
export const DEV_ROUTER_ADDRESS = process.env.VUE_APP_DEV_ROUTER_ADDRESS
export const BLOCK_EXPLORER_BASE_URL = {
    [ChainId.MAINNET]: 'https://bscscan.com',
    [ChainId.TESTNET]: 'https://testnet.bscscan.com'
}

export const getEnv = () => {
    return {
        chainId: CHAIN_ID
    }
}

export const appBaseUrl = process.env.NODE_ENV === "production" ? process.env.VUE_APP_BASE_URL : ''
export const isTestnet = process.env.VUE_APP_IS_TESTNET ? !!process.env.VUE_APP_IS_TESTNET : true
export const infuraKey = process.env.VUE_APP_INFURA_KEY ? process.env.VUE_APP_INFURA_KEY : ''
export const bnbTestnetRpcUrl = process.env.VUE_APP_BNB_TESTNET_RPC_URL? process.env.VUE_APP_BNB_TESTNET_RPC_URL: ''