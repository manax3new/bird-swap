import { getConstantTokens } from '@/constant/config/tokens'
import { PoolCategory } from './types'
import useWeb3Connect from '@/use/Web3Connect'

export const getPoolConfig = () => {

    const Web3Connect = useWeb3Connect()
    const chainId = Web3Connect.chainId

    const TOKENS = getConstantTokens()
    const serializedTokens = TOKENS

    const pools = [
        // {
        //   sousId: 0,
        //   stakingToken: serializedTokens.bird,
        //   earningToken: serializedTokens.bird,
        //   contractAddress: {
        //     97: '0x848f014D05cfE01d187196851C464f39290bb663',
        //     56: '0x73feaa1eE314F8c655E354234017bE2193C9E24E',
        //   },
        //   poolCategory: PoolCategory.CORE,
        //   harvest: true,
        //   tokenPerBlock: '10',
        //   sortOrder: 1,
        //   isFinished: false,
        // },
        // {
        //   sousId: 1,
        //   stakingToken: serializedTokens.busd,
        //   earningToken: serializedTokens.bird,
        //   contractAddress: {
        //     97: '0x16a97D081508cc0258f730011AF77DeC2b08730c',
        //     56: '',
        //   },
        //   poolCategory: PoolCategory.CORE,
        //   harvest: true,
        //   tokenPerBlock: '1',
        //   sortOrder: 2,
        //   isFinished: true,
        // },
        // {
        //   sousId: 2,
        //   stakingToken: serializedTokens.busd,
        //   earningToken: serializedTokens.bird,
        //   contractAddress: {
        //     97: '0xfabadb9ba84c3abfcd3532e40be003bec2105b26',
        //     56: '',
        //   },
        //   poolCategory: PoolCategory.CORE,
        //   harvest: true,
        //   tokenPerBlock: '1',
        //   sortOrder: 2,
        //   isFinished: false,
        // },
        // {
        //   sousId: 3,
        //   stakingToken: serializedTokens.usdt,
        //   earningToken: serializedTokens.bird,
        //   contractAddress: {
        //     97: '0x412686632Cc41E04AA044E6157734836299662e9',
        //     56: '',
        //   },
        //   poolCategory: PoolCategory.CORE,
        //   harvest: true,
        //   tokenPerBlock: '0.000000000000000001',
        //   sortOrder: 2,
        //   isFinished: false,
        // },
        // {
        //   sousId: 4,
        //   stakingToken: serializedTokens.usdt,
        //   earningToken: serializedTokens.bird,
        //   contractAddress: {
        //     97: '0x7cfC3213D8f7b986745b4D251f3784CA2291D3b8',
        //     56: '',
        //   },
        //   poolCategory: PoolCategory.CORE,
        //   harvest: true,
        //   tokenPerBlock: '0.1',
        //   sortOrder: 2,
        //   isFinished: false,
        // },
        {
          sousId: 0,
          stakingToken: serializedTokens.bird,
          earningToken: serializedTokens.bird,
          contractAddress: {
            97: '0x0E141BE02cE337a366fF09C8B8926F873b5DE5ca',
            56: '',
          },
          poolCategory: PoolCategory.CORE,
          harvest: true,
          tokenPerBlock: '40',
          sortOrder: 1,
          isFinished: false,
        },
    ].filter((p) => !!p.contractAddress[chainId.value])

    return pools
}
