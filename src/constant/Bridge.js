import CHAIN from '@/constant/Chain'
import MULTICALL_BNB_TESTNET from '@/constant/abi/bnbTestnet/multicall.json'
import MULTICALL_SEPOLIA_TESTNET from '@/constant/abi/sepoliaTestnet/multicall.json'
import MULTICALL_ETHEREUM_MAINNET from '@/constant/abi/ethereumMainnet/multicall.json'
import { Token } from '@pancakeswap/sdk'

export const BRIDGE_CONTRACT_ADDRESS = {
    [CHAIN.bnbTestnet.chainId]: '0x6C3Ea55260B8f7F0a62bE332B952F9233ebbDe3D',
    [CHAIN.sepoliaTestnet.chainId]: '0xFDD35f0eCF704b7828469A19ffd34912D9e10c62',
}

export const MULTICALL_ADDRESS = {
    [CHAIN.bnbTestnet.chainId]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576',
    [CHAIN.sepoliaTestnet.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [CHAIN.ethereumMainnet.chainId]: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
}

export const MULTICALL_ABI = {
    [CHAIN.bnbTestnet.chainId]: MULTICALL_BNB_TESTNET,
    [CHAIN.sepoliaTestnet.chainId]: MULTICALL_BNB_TESTNET,
    // [CHAIN.ethereumMainnet.chainId]: MULTICALL_ETHEREUM_MAINNET,
    [CHAIN.ethereumMainnet.chainId]: MULTICALL_BNB_TESTNET,
}

export const RPC_URL = {
    [CHAIN.bnbTestnet.chainId]: CHAIN.bnbTestnet.rpcUrl,
    [CHAIN.sepoliaTestnet.chainId]: CHAIN.sepoliaTestnet.rpcUrl,
    [CHAIN.ethereumMainnet.chainId]: CHAIN.ethereumMainnet.rpcUrl,
}

export const TOKENS = {
    [CHAIN.bnbTestnet.chainId]: {
        usdt: new Token(
            CHAIN.bnbTestnet.chainId,
            '0x9aC9cdD0c5512eFe69e599db74A2148f68e4cAD8',
            18,
            'BIRD',
            'Birdswap Token',
            'https://www.birdswap.org/',
        ),
    },
    [CHAIN.sepoliaTestnet.chainId]: {
        usdt: new Token(
            CHAIN.sepoliaTestnet.chainId,
            '0x1BfEA78465784C2AB2FD4A93eb7C608D814f9c7f',
            18,
            'BIRD',
            'Birdswap Token',
            'https://www.birdswap.org/',
        ),
    },
    [CHAIN.ethereumMainnet.chainId]: {
        usdt: {
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
    },
}