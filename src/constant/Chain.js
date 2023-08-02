import { sepoliaRpcUrl, bnbTestnetRpcUrl } from '@/constant/config/Env'

export default {
    bnbTestnet: {
        chainId: 97,
        name: 'BNB Smart Chain Testnet',
        rpcUrl: `${bnbTestnetRpcUrl}`,
        currencySymbol: 'tBNB',
        blockExplorerUrl: 'https://testnet.bscscan.com',
    },
    sepoliaTestnet: {
        chainId: 11155111,
        name: 'Sepolia test network',
        rpcUrl: `${sepoliaRpcUrl}`,
        currencySymbol: 'SepoliaETH',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
    },
}