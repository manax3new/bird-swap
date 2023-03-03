import { simpleRpcProvider } from '@/utils/providers'

export default async () => {

    const initialBlockNumber = await simpleRpcProvider.getBlockNumber()

    const useCurrentBlock = async () => {
        return await simpleRpcProvider.getBlockNumber()
    }
    
    const useInitialBlock = async () => {
        return initialBlockNumber
    }

    return {
        useCurrentBlock,
        useInitialBlock,
    }
}



