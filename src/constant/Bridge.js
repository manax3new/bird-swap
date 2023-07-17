import CHAIN from '@/constant/Chain'
import { Token } from '@pancakeswap/sdk'

export const BRIDGE_CONTRACT_ADDRESS = {
    [CHAIN.bnbTestnet.chainId]: '0x8493786453107BBeb8a2f08EdF970BB7B1fbd756',
    [CHAIN.sepoliaTestnet.chainId]: '0x155ba527b671Dc82e31144503d6f45Db162E9B8F',
}

export const MULTICALL_ADDRESS = {
    [CHAIN.bnbTestnet.chainId]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576',
    [CHAIN.sepoliaTestnet.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
}

export const RPC_URL = {
    [CHAIN.bnbTestnet.chainId]: CHAIN.bnbTestnet.rpcUrl,
    [CHAIN.sepoliaTestnet.chainId]: CHAIN.sepoliaTestnet.rpcUrl,
}

export const TOKENS = {
    [CHAIN.bnbTestnet.chainId]: {
        BIRD: new Token(
            CHAIN.bnbTestnet.chainId,
            '0x9aC9cdD0c5512eFe69e599db74A2148f68e4cAD8',
            18,
            'BIRD',
            'Birdswap Token',
            'https://www.birdswap.org/',
        ),
    },
    [CHAIN.sepoliaTestnet.chainId]: {
        BIRD: new Token(
            CHAIN.sepoliaTestnet.chainId,
            '0x1BfEA78465784C2AB2FD4A93eb7C608D814f9c7f',
            18,
            'BIRD',
            'Birdswap Token',
            'https://www.birdswap.org/',
        ),
    },
}