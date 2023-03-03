import { useMasterChefContract } from '@/use/Contract'
import { useCallWithGasPrice } from '@/use/CallWithGasPrice'
import { MaxUint256 } from '@ethersproject/constants'

const useApproveFarm = (lpContract) => {
    const masterChefContract = useMasterChefContract()
    const { callWithGasPrice } = useCallWithGasPrice()
    const handleApprove = async () => {
        return callWithGasPrice(lpContract, 'approve', [masterChefContract.options.address, MaxUint256])
    }
    return { onApprove: handleApprove }
}

export default useApproveFarm