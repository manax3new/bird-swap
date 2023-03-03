import { useCallWithGasPrice } from '@/use/CallWithGasPrice'
import { MaxUint256 } from '@ethersproject/constants'
import { useSousChef } from '@/use/Contract'

export const useApprovePool = (lpContract, sousId) => {
    const sousChefContract = useSousChef(sousId)
    const { callWithGasPrice } = useCallWithGasPrice()
    const handleApprove = async () => {
        return callWithGasPrice(lpContract, 'approve', [sousChefContract.address, MaxUint256])
    }
    return { handleApprove }
}
