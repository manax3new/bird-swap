import { infuraKey } from '@/constant/config/Env'

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
        rpcUrl: `https://sepolia.infura.io/v3/${infuraKey}`,
        currencySymbol: 'SepoliaETH',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
    },
    ethereumMainnet: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: `https://mainnet.infura.io/v3/${infuraKey}`,
        currencySymbol: 'ETH',
        blockExplorerUrl: 'https://etherscan.io',
    },
}