import { useGasPrice } from '@/state/user/hook'
import get from 'lodash/get'
import { viewTransactionOnBscUrl } from '@/lib/utils.js'
import { ElNotification } from 'element-plus'

export const useCallWithGasPrice = () => {

    const gasPrice = useGasPrice()

    const callWithGasPrice = async (contract, methodName, methodArgs, overrides = null) => {

        const contractMethod = get(contract, methodName)
        const hasManualGasPriceOverride = overrides?.gasPrice

        const tx = await contractMethod(
            ...methodArgs,
            hasManualGasPriceOverride ? { ...overrides } : { ...overrides, gasPrice },
        )
        if(tx) {
            ElNotification({
                customClass: 'top-of-every-thing',
                type: 'success',
                title: 'Transaction Submitted!',
                dangerouslyUseHTMLString: true,
                message: `<a href="${viewTransactionOnBscUrl(tx.hash)}" target="_blank">View on BscScan: ${tx.hash}</a>`,
                duration: 10 * 1000,
            })
        }
        return tx
    }

    return {
        callWithGasPrice
    }
}