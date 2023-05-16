import CHAIN from '@/constant/Chain'
import MULTICALL_BNB_TESTNET from '@/constant/abi/bnbTestnet/multicall.json'
import MULTICALL_SEPOLIA_TESTNET from '@/constant/abi/sepoliaTestnet/multicall.json'
import MULTICALL_ETHEREUM_MAINNET from '@/constant/abi/ethereumMainnet/multicall.json'

export const MULTICALL_ADDRESS = {
    [CHAIN.bnbTestnet.chainId]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576',
    [CHAIN.sepoliaTestnet.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [CHAIN.ethereumMainnet.chainId]: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
}

export const MULTICALL_ABI = {
    [CHAIN.bnbTestnet.chainId]: MULTICALL_BNB_TESTNET,
    [CHAIN.sepoliaTestnet.chainId]: MULTICALL_SEPOLIA_TESTNET,
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
        usdt: {
            address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
        },
    },
    [CHAIN.sepoliaTestnet.chainId]: {
        usdt: {
            address: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
        },
    },
    [CHAIN.ethereumMainnet.chainId]: {
        usdt: {
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
    },
}