import { ChainId, JSBI, Percent } from '@pancakeswap/sdk'
import { mainnetTokens, testnetTokens } from './tokens'
import { BIG_TEN } from '@/utils/bigNumber'

export const CAKE_TOKEN_INFO = {
    symbol: 'BIRD',
    name: 'Birdswap Token',
    nameShort: 'Bird',
}

export const GELATO_NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const BASES_TO_CHECK_TRADES_AGAINST = {
    [ChainId.MAINNET]: [
      mainnetTokens.wbnb,
      mainnetTokens.cake,
      mainnetTokens.busd,
      mainnetTokens.usdt,
      mainnetTokens.btcb,
      mainnetTokens.ust,
      mainnetTokens.eth,
      mainnetTokens.usdc,
    ],
    [ChainId.TESTNET]: [testnetTokens.wbnb, testnetTokens.cake, testnetTokens.busd],
}

export const ADDITIONAL_BASES = {
    [ChainId.MAINNET]: {},
}
  
export const CUSTOM_BASES = {
    [ChainId.MAINNET]: {},
}

export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)

export const ALLOWED_PRICE_IMPACT_LOW = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

export const BASE_TOKENS = {
    [ChainId.MAINNET]: [
        mainnetTokens.wbnb,
        mainnetTokens.dai,
        mainnetTokens.busd,
        mainnetTokens.usdt,
    ],
    [ChainId.TESTNET]: [
        testnetTokens.wbnb, 
        testnetTokens.cake, 
        testnetTokens.busd
    ],
}

export const PINNED_PAIRS = {
    [ChainId.MAINNET]: [
        [mainnetTokens.cake, mainnetTokens.wbnb],
        [mainnetTokens.busd, mainnetTokens.usdt],
        [mainnetTokens.dai, mainnetTokens.usdt],
    ],
    [ChainId.TESTNET]: [
        [testnetTokens.cake, testnetTokens.wbnb],
        [testnetTokens.busd, testnetTokens.cake],
        [testnetTokens.busd, testnetTokens.wbnb],
    ],
}

export const BSC_BLOCK_TIME = 3
export const CAKE_PER_BLOCK = 40
export const BLOCKS_PER_YEAR = (60 / BSC_BLOCK_TIME) * 60 * 24 * 365 // 10512000
export const CAKE_PER_YEAR = CAKE_PER_BLOCK * BLOCKS_PER_YEAR
export const DEFAULT_GAS_LIMIT = 250000
export const DEFAULT_TOKEN_DECIMAL = BIG_TEN.pow(18)