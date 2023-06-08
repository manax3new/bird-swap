import { infuraKey, bnbTestnetRpcUrl } from '@/constant/config/Env'

export default {
    bnbTestnet: {
        chainId: 97,
        name: 'BNB Smart Chain Testnet',
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        currencySymbol: 'tBNB',
        blockExplorerUrl: 'https://testnet.bscscan.com',
    },
    sepoliaTestnet: {
        chainId: 11155111,
        name: 'Sepolia test network',
        rpcUrl: `https://rpc.sepolia.org`,
        currencySymbol: 'SepoliaETH',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
    },
    ethereumMainnet: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: `https://ethereum.publicnode.com`,
        currencySymbol: 'ETH',
        blockExplorerUrl: 'https://etherscan.io',
    },
}