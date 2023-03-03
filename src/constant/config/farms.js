import { getConstantTokens } from '@/constant/config/tokens'

export const getFarmsConfig = () => {

    const TOKENS = getConstantTokens()

    // const farms = [
    //     {
    //         pid: 0,
    //         lpSymbol: 'CAKE',
    //         lpAddresses: {
    //             97: '0x9C21123D94b93361a29B2C2EFB3d5CD8B17e0A9e',
    //             56: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    //         },
    //         token: TOKENS.syrup,
    //         quoteToken: TOKENS.wbnb,
    //     },
    //     {
    //         pid: 2,
    //         lpSymbol: 'BIRD-BNB LP',
    //         lpAddresses: {
    //             97: '0x0bEc8a8f48076223ff25DBa6311599d5e8d59fC0',
    //             56: '',
    //         },
    //         token: TOKENS.bird,
    //         quoteToken: TOKENS.wbnb,
    //     },
    //     {
    //         pid: 3,
    //         lpSymbol: 'BUSD-BNB LP',
    //         lpAddresses: {
    //             97: '0xa6587bC0cEA777df01BA423Ae7CBE2298ce3E785',
    //             56: '',
    //         },
    //         token: TOKENS.busd,
    //         quoteToken: TOKENS.wbnb,
    //     },
    // ]

    const farms = [
        {
            pid: 0,
            lpSymbol: 'BIRD',
            lpAddresses: {
                97: '0x9aC9cdD0c5512eFe69e599db74A2148f68e4cAD8',
                56: '',
            },
            token: TOKENS.syrup,
            quoteToken: TOKENS.wbnb,
        },
        {
            pid: 1,
            lpSymbol: 'BUSD-BNB LP',
            lpAddresses: {
                97: '0x1d6B50C573036f7a9b36B04E21b7FA3086AA5bDb',
                56: '',
            },
            token: TOKENS.busd,
            quoteToken: TOKENS.wbnb,
        },
        {
            pid: 2,
            lpSymbol: 'BIRD-BNB LP',
            lpAddresses: {
                97: '0x48498E43628De66a78e51bE7adA0eCf3b6A143fE',
                56: '',
            },
            token: TOKENS.bird,
            quoteToken: TOKENS.wbnb,
        },
    ]

    

    return farms
}
