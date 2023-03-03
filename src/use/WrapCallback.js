import useWeb3Connect from '@/use/Web3Connect'
import { useWBNBContract } from '@/use/Contract'
import { useCurrencyBalance } from '@/state/wallet/hooks'
import tryParseAmount from '@/utils/tryParseAmount'
import { ETHER, WETH, currencyEquals } from '@pancakeswap/sdk'
import { useGasPrice } from '@/state/user/hook'
import { ElNotification } from 'element-plus'
import { toastError } from '@/use/Toast'
import { viewTransactionOnBscUrl } from '@/lib/utils.js'
import contractErrorExtract from '@/lib/contractErrorExtract'

export const WrapType = {
    NOT_APPLICABLE: 0,
    WRAP: 1,
    UNWRAP: 2,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }

export async function useWrapCallback(inputCurrency, outputCurrency, typedValue) {

    const Web3Connect = useWeb3Connect()    

    const account = Web3Connect.account
    const chainId = Web3Connect.chainId

    const wbnbContract = useWBNBContract()

    const gasPrice = useGasPrice()

    const balance = await useCurrencyBalance(account.value, inputCurrency)

    const inputAmount = tryParseAmount(typedValue, inputCurrency)

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)

    if (inputCurrency === ETHER && currencyEquals(WETH[chainId.value], outputCurrency)) {
        return {
            wrapType: WrapType.WRAP,
            execute:
                sufficientBalance && inputAmount
                ? async () => {
                    try {
                        const tx = wbnbContract.methods.deposit()
                        const estimatedGas = (await tx.estimateGas({
                            value: `0x${inputAmount.raw.toString(16)}`,
                            from: account.value.address
                        })).toString()
                        const result = await tx.send({
                            value: `0x${inputAmount.raw.toString(16)}`,
                            from: account.value.address,
                            gas: estimatedGas,
                            gasPrice: gasPrice,
                        })
                        ElNotification({
                            customClass: 'top-of-every-thing',
                            type: 'success',
                            title: 'Transaction receipt',
                            dangerouslyUseHTMLString: true,
                            message: `<a href="${viewTransactionOnBscUrl(result.transactionHash)}" target="_blank">View on BscScan: ${result.transactionHash}</a>`,
                            duration: 10 * 1000,
                        })
                        return true
                    } catch (error) {
                        toastError('Error', contractErrorExtract(error.message))
                        return false
                    }
                }
                : undefined,
            inputError: sufficientBalance ? undefined : 'Insufficient BNB balance',
        }
    }
    if (currencyEquals(WETH[chainId.value], inputCurrency) && outputCurrency === ETHER) {
        return {
            wrapType: WrapType.UNWRAP,
            execute:
                sufficientBalance && inputAmount
                ? async () => {
                    try {
                        const tx = wbnbContract.methods.withdraw(`0x${inputAmount.raw.toString(16)}`)
                        const estimatedGas = (await tx.estimateGas({
                            from: account.value.address
                        })).toString()
                        const result = await tx.send({
                            from: account.value.address,
                            gas: estimatedGas,
                            gasPrice: gasPrice,
                        })
                        ElNotification({
                            customClass: 'top-of-every-thing',
                            type: 'success',
                            title: 'Transaction receipt',
                            dangerouslyUseHTMLString: true,
                            message: `<a href="${viewTransactionOnBscUrl(result.transactionHash)}" target="_blank">View on BscScan: ${result.transactionHash}</a>`,
                            duration: 10 * 1000,
                        })
                        return true
                    } catch (error) {
                        toastError('Error', contractErrorExtract(error.message))
                        return false
                    }
                }
                : undefined,
            inputError: sufficientBalance ? undefined : 'Insufficient WBNB balance',
        }
    }
    return NOT_APPLICABLE
}