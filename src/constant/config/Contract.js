import { ChainId } from '@pancakeswap/sdk'
import { DEV_ROUTER_ADDRESS } from '@/constant/config/Env'

export const ROUTER_ADDRESS = {
    [ChainId.MAINNET]: process.env.VUE_APP_ROUTER_ADDRESS,
    // [ChainId.TESTNET]: '0xFDD35f0eCF704b7828469A19ffd34912D9e10c62',
    [ChainId.TESTNET]: '0x0fd76af5d08aa0eeb92cc64b37f45f2661194d3a',
    999: DEV_ROUTER_ADDRESS,
}

export const FACTORY_ADDRESS = {
    [ChainId.MAINNET]: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    // [ChainId.TESTNET]: '0x1BfEA78465784C2AB2FD4A93eb7C608D814f9c7f',
    [ChainId.TESTNET]: '0x0eefda6e93f1043508E6E3F571Adc9A3204a53eF',
    999: '',
}

export const MASTER_CHEF_ADDRESS = {
    [ChainId.MAINNET]: '0x73feaa1eE314F8c655E354234017bE2193C9E24E',
    // [ChainId.TESTNET]: '0x848f014D05cfE01d187196851C464f39290bb663',
    [ChainId.TESTNET]: '0x0E141BE02cE337a366fF09C8B8926F873b5DE5ca',
}

export const MULTICALL_ADDRESS = {
    [ChainId.MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    [ChainId.TESTNET]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576',
}