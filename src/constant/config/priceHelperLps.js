import { getConstantTokens } from '@/constant/config/tokens'

const getPriceHelperLps = () => {

	const TOKENS = getConstantTokens()

	const priceHelperLps = [
		{
			pid: null,
			lpSymbol: 'QSD-BNB LP',
			lpAddresses: {
				97: '0xE274b255179df108d860B00E5cC59B329ad61B1F',
				56: '0x7b3ae32eE8C532016f3E31C8941D937c59e055B9',
			},
			token: TOKENS.qsd,
			quoteToken: TOKENS.wbnb,
		},
	]
	return priceHelperLps
}

export default getPriceHelperLps