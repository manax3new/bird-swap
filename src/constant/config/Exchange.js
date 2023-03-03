import { ChainId } from '@pancakeswap/sdk'

export const ROUTER_ADDRESS = {
    [ChainId.MAINNET]: process.env.VUE_APP_ROUTER_ADDRESS,
    // [ChainId.TESTNET]: '0xFDD35f0eCF704b7828469A19ffd34912D9e10c62',
    [ChainId.TESTNET]: '0x0fd76af5d08aa0eeb92cc64b37f45f2661194d3a',
}