import useParseSdkEntity from '@/use/ParseSdkEntity.js'

const ParseSdkEntity = useParseSdkEntity()

export default {
    BNB: ParseSdkEntity.createToken({
        name: 'BNB',
        symbol: 'BNB',
        address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        chainId: 56,
        decimals: 18,
        'logoURI': ''
    }),
    WBNB: ParseSdkEntity.createToken({
        "name": "WBNB Token",
        "symbol": "WBNB",
        "address": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "chainId": 56,
        "decimals": 18,
        "logoURI": "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png"
    }),
    DAI: ParseSdkEntity.createToken({
        "name": "Binance Pegged DAI",
        "symbol": "DAI",
        "address": "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
        "chainId": 56,
        "decimals": 18,
        "logoURI": "https://tokens.pancakeswap.finance/images/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3.png"
    }),
    BUSD: ParseSdkEntity.createToken({
        "name": "Binance Pegged BUSD",
        "symbol": "BUSD",
        "address": "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        "chainId": 56,
        "decimals": 18,
        "logoURI": "https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png"
    }),
    USDT: ParseSdkEntity.createToken({
        "name": "Binance Pegged USDT",
        "symbol": "USDT",
        "address": "0x55d398326f99059fF775485246999027B3197955",
        "chainId": 56,
        "decimals": 18,
        "logoURI": "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png"
    }),
    CAKE: ParseSdkEntity.createToken({
        "name": "PancakeSwap Token",
        "symbol": "CAKE",
        "address": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
        "chainId": 56,
        "decimals": 18,
        "logoURI": "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png"
    }),
    BTCB: ParseSdkEntity.createToken({
            "name": "BTCB Token",
            "symbol": "BTCB",
            "address": "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
            "chainId": 56,
            "decimals": 18,
            "logoURI": "https://pancakeswap.finance/images/tokens/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c.png"
    }),
}