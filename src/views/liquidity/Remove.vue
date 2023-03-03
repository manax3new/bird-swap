<template>
<div class="Remove flex-center">
    <div>
        <el-card v-if="!isLoading && form.currencyA && form.currencyB">
            <BackButton></BackButton>
            <h1>Remove {{form.currencyA.symbol}}-{{form.currencyB.symbol}} liquidity</h1>
            <h3>To receive {{form.currencyA.symbol}} and {{form.currencyB.symbol}}</h3>
            <el-divider />
            <div class="flex justify-content-space-between align-items-center">
                <div>
                    <h3>Amount</h3>
                </div>
                <div>
                    <el-button type="primary" link>Detailed</el-button>
                </div>
            </div>
            <el-card>
                <h1>{{form.percent}}%</h1>
                <el-slider v-model="form.percent" />
                <div class="flex-center">
                    <el-button @click="() => {form.percent = 25}" plain round>25%</el-button>
                    <el-button @click="() => {form.percent = 50}" plain round>50%</el-button>
                    <el-button @click="() => {form.percent = 75}" plain round>75%</el-button>
                    <el-button @click="() => {form.percent = 100}" plain round>Max</el-button>
                </div>
            </el-card>
            <br>
            <div class="flex-center">
                <el-icon>
                    <Bottom />
                </el-icon>
            </div>
            <br>
            <div>
                RECEIVE
            </div>
            <div>
                <el-card>
                    <div class="flex justify-content-space-between align-items-center">
                        <div class="flex align-items-center">
                            <el-space :size="2">
                                <TokenIcon size="small" :token="form.currencyA"></TokenIcon>
                                <div>{{form.currencyA.symbol}}</div>
                            </el-space>
                        </div>
                        <div style="text-align: right;">
                            <div>{{ currencyAToRecieveDisplay }}</div>
                            <div v-if="isEther(form.currencyA)">
                                <el-button type="primary" link>Receive WBNB</el-button>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-content-space-between align-items-center">
                        <div class="flex align-items-center">
                            <el-space :size="2">
                                <TokenIcon size="small" :token="form.currencyB"></TokenIcon>
                                <div>{{form.currencyB.symbol}}</div>
                            </el-space>
                        </div>
                        <div style="text-align: right;">
                            <div>{{ currencyBToRecieveDisplay }}</div>
                            <div v-if="isEther(form.currencyB)">
                                <el-button @click="receiveBAsWBNB" type="primary" link>Receive WBNB</el-button>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>
            <br>
            <div>
                PRICE
            </div>
            <div>
                <el-card>
                    <div class="flex justify-content-space-between align-items-center">
                        <div>1 {{form.currencyA.symbol}} =</div>
                        <div>{{ priceOfTokenADisplay }} {{form.currencyB.symbol}}</div>
                    </div>
                    <div class="flex justify-content-space-between align-items-center">
                        <div>1 {{form.currencyB.symbol}} =</div>
                        <div>{{ priceOfTokenBDisplay }} {{form.currencyA.symbol}}</div>
                    </div>
                </el-card>
            </div>
            <br>
            <div class="flex-center">
                <el-button 
                    :disabled="!canEnable" 
                    @click="onAttemptToApprove" 
                    type="primary" 
                    class="custom-button-100percent">
                        {{ enableButtonLabel }}
                </el-button>
                <el-button 
                    :disabled="!canRemove" 
                    @click="toRemove"
                    type="primary" 
                    class="custom-button-100percent">
                        Remove
                </el-button>
            </div>
        </el-card>
        <br>
        <LiquidityCardPreview v-if="burnInfo?.pair" :pair="burnInfo.pair"></LiquidityCardPreview>
    </div>
    <el-dialog
        v-model="confirmRemoveLiquidityDialogVisible"
        title="You will receive"
        width="50%"
    >
        <div v-if="form.currencyA && form.currencyB">
            <div class="flex justify-content-space-between">
                <div>
                    <h3>{{ currencyAToRecieveDisplay }}</h3>
                </div>
                <div class="flex align-items-center">
                    <el-space :size="2">
                        <TokenIcon size="small" :token="form.currencyA"></TokenIcon>
                        <h3>
                            {{ form.currencyA.symbol }}
                        </h3>
                    </el-space>
                </div>
            </div>
            <div>
                +
            </div>
            <div class="flex justify-content-space-between">
                <div>
                    <h3>{{ currencyBToRecieveDisplay }}</h3>
                </div>
                <div class="flex align-items-center">
                    <el-space :size="2">
                        <TokenIcon size="small" :token="form.currencyB"></TokenIcon>
                        <h3>{{ form.currencyB.symbol }}</h3>
                    </el-space>
                </div>
            </div>
            <div>
                Output is estimated. If the price changes by more than {{ allowedSlippagePercentFormat(allowedSlippage) }}% your transaction will revert.
            </div>
            <div class="flex justify-content-space-between">
                <div>
                    <h4>{{ form.currencyA.symbol }}/{{ form.currencyB.symbol }} Burned</h4>
                </div>
                <div class="flex align-items-center">
                    <el-space :size="2">
                        <TokenIcon :size="18" :token="form.currencyA"></TokenIcon>
                        <TokenIcon :size="18" :token="form.currencyB"></TokenIcon>
                        <h4 v-if="burnInfo.parsedAmounts?.['LIQUIDITY']">{{ burnInfo.parsedAmounts['LIQUIDITY'].toSignificant(6) }}</h4>
                    </el-space>
                </div>
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="custom-button-100percent" type="primary" :disabled="isOnRemove" @click="onRemove">Confirm</el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog
        v-model="waitingConfirmRemoveLiquidityDialogVisible"
        title="You will receive"
        width="50%"
    >
        <div v-if="form.currencyA && form.currencyB" class="text-align-center">
            <h1>Waiting For Confirmation</h1>
            <h3>Removing {{currencyAToRecieveDisplay}} {{form.currencyA.symbol}} and {{currencyBToRecieveDisplay}} {{form.currencyB.symbol}}</h3>
            <h4>Confirm this transaction in your wallet</h4>
        </div>
    </el-dialog>
    <el-dialog
        v-model="removeLiquiditySuccessDialogVisible"
        title="You will receive"
        width="50%"
    >
        <div class="text-align-center">
            <h1>Transaction Submitted</h1>
            <h3><a :href="viewTransactionOnBscUrl(form.transactionHash)" target="_blank">View on BscScan</a></h3>
            <el-button @click="removeLiquiditySuccessDialogVisible = false" type="primary">Close</el-button>
        </div>
    </el-dialog>
</div>
</template>
<script>

import BackButton from '@/components/BackButton'
import { reactive, onMounted, ref, watch, watchEffect, computed } from 'vue'
import { Bottom } from '@element-plus/icons-vue'
import { ETHER } from '@pancakeswap/sdk'
import TokenIcon from '@/components/TokenIcon'
import { useRoute, useRouter } from 'vue-router'
import { useCurrency } from '@/use/Tokens'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { useDerivedBurnInfo } from '@/state/burn/hook'
import LiquidityCardPreview from '@/components/LiquidityCardPreview'
import { usePairContract, useRouterContract } from '@/use/Contract'
import useWeb3Connect from '@/use/Web3Connect'
import useTransactionDeadline from '@/use/TransactionDeadline'
import { ROUTER_ADDRESS } from '@/constant/config/Exchange'
import { BigNumber } from '@ethersproject/bignumber'
import { splitSignature } from '@ethersproject/bytes'
import { useUserSlippageTolerance, useGasPrice } from '@/state/user/hook'
import { calculateSlippageAmount } from '@/utils/exchange'
import { toastError } from '@/use/Toast'
import contractErrorExtract from '@/lib/contractErrorExtract'
import { allowedSlippagePercentFormat, viewTransactionOnBscUrl, isEther } from '@/lib/utils.js'
import { ElNotification } from 'element-plus'
import { getConstantTokens } from '@/constant/config/tokens'

export default {
    components: {
        BackButton,
        Bottom,
        TokenIcon,
        LiquidityCardPreview,
    },
    setup() {

        const route = useRoute()
        const router = useRouter()
        const Web3Connect = useWeb3Connect()
        const chainId = Web3Connect.chainId
        const [ allowedSlippage ] = useUserSlippageTolerance()

        const TOKENS = getConstantTokens()

        const form = reactive({
            independentField: 'LIQUIDITY_PERCENT',
            typedValue: 0,
            percent: 0,
            currencyA: null,
            currencyB: null,
            tokenA: null,
            tokenB: null,
            transactionHash: '',
        })

        const burnInfo = reactive({
            pair: null,
            parsedAmounts: null,
        })

        const signatureData = ref(null)

        const isLoading = ref(false)
        const isEnabling = ref(false)
        const confirmRemoveLiquidityDialogVisible = ref(false)
        const waitingConfirmRemoveLiquidityDialogVisible = ref(false)
        const removeLiquiditySuccessDialogVisible = ref(false)
        const isOnRemove = ref(false)

        const currencyAToRecieve = computed(() => {
            return burnInfo?.parsedAmounts?.CURRENCY_A ? burnInfo?.parsedAmounts?.CURRENCY_A : null
        })

        const currencyAToRecieveDisplay = computed(() => {
            return currencyAToRecieve.value ? currencyAToRecieve.value.toSignificant(6) : '-'
        })

        const currencyBToRecieve = computed(() => {
            return burnInfo?.parsedAmounts?.CURRENCY_B ? burnInfo?.parsedAmounts?.CURRENCY_B : null
        })

        const currencyBToRecieveDisplay = computed(() => {
            return currencyBToRecieve.value ? currencyBToRecieve.value.toSignificant(6) : '-'
        })

        const priceOfTokenADisplay = computed(() => {
            if(!form.tokenA || !burnInfo.pair) {
                return '-'
            }
            return  burnInfo.pair.priceOf(form.tokenA).toSignificant(6)
        })

        const priceOfTokenBDisplay = computed(() => {
            if(!form.tokenB || !burnInfo.pair) {
                return '-'
            }
            return  burnInfo.pair.priceOf(form.tokenB).toSignificant(6)
        })

        const canEnable = computed(() => {
            return !signatureData.value && !isEnabling.value && burnInfo.parsedAmounts['LIQUIDITY']
        })

        const canRemove = computed(() => {
            return signatureData.value && burnInfo.parsedAmounts['LIQUIDITY']
        })

        const enableButtonLabel = computed(() => {
            return isEnabling.value ? 'Enabling...' : 'Enable'
        })

        watch(() => route.params, () => {
            loadData()
        })

        watch(() => form.percent, (newVal) => {
            if(form.independentField === 'LIQUIDITY_PERCENT') {
                form.typedValue = newVal
            }
        })

        watchEffect(async () => {
            const {pair, parsedAmounts} = await useDerivedBurnInfo(form.tokenA, form.tokenB, form.independentField, form.typedValue)
            burnInfo.pair = pair
            burnInfo.parsedAmounts = parsedAmounts
            clearSignatureData()
        })

        const loadData = async () => {
            isLoading.value = true
            const currencyIdA = route.params.tokenAAddress
            const currencyIdB = route.params.tokenBAddress
            const currencyA = await useCurrency(currencyIdA)
            const currencyB = await useCurrency(currencyIdB)
            form.currencyA = currencyA
            form.currencyB = currencyB
            const tokenA = wrappedCurrency(currencyA, chainId.value)
            const tokenB = wrappedCurrency(currencyB, chainId.value)
            form.tokenA = tokenA
            form.tokenB = tokenB
            isLoading.value = false
        }

        const receiveAAsWBNB = () => {
            router.push({
                name: 'RemoveLiquidity', 
                params: {
                    tokenAAddress: TOKENS.wbnb.address, 
                    tokenBAddress: route.params.tokenBAddress
                }
            })
        }

        const receiveBAsWBNB = () => {
            router.push({
                name: 'RemoveLiquidity', 
                params: {
                    tokenAAddress: route.params.tokenAAddress, 
                    tokenBAddress: TOKENS.wbnb.address
                }
            })
        }

        const onAttemptToApprove = async () => {

            isEnabling.value = true
            
            const deadline = await useTransactionDeadline()
            const pair = burnInfo.pair
            const pairContract = usePairContract(pair?.liquidityToken?.address)

            if (!pairContract || !pair || !deadline) {
                isEnabling.value = false
                return
            }

            const liquidityAmount = burnInfo.parsedAmounts['LIQUIDITY']
            if (!liquidityAmount) {
                isEnabling.value = false
                throw new Error('missing liquidity amount')
            }
            
            const account = Web3Connect.getAccount()
            const nonce = BigNumber.from(await pairContract.methods.nonces(account.address).call())

            const EIP712Domain = [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
            ]
            const domain = {
                name: 'Bird LPs',
                version: '1',
                chainId: chainId.value,
                verifyingContract: pair.liquidityToken.address,
            }
            const Permit = [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
            ]
            const message = {
                owner: account.address,
                spender: ROUTER_ADDRESS[chainId.value],
                value: liquidityAmount.raw.toString(),
                nonce: nonce.toHexString(),
                deadline: deadline.toNumber(),
            }
            const data = JSON.stringify({
                types: {
                    EIP712Domain,
                    Permit,
                },
                domain,
                primaryType: 'Permit',
                message,
            })

            let signed

            try {
                signed = await window.ethereum.request({
                    method: 'eth_signTypedData_v4',
                    params: [account.address, data],
                    from: account.address,
                })
            } catch (error) {
                console.log('eth_signTypedData_v4 error', error.message)
                isEnabling.value = false
                return
            }

            const signature = await splitSignature(signed)

            signatureData.value = {
                v: signature.v,
                r: signature.r,
                s: signature.s,
                deadline: deadline.toNumber()
            }

            isEnabling.value = false
        }

        const toRemove = async () => {
            confirmRemoveLiquidityDialogVisible.value = true
        }

        const onRemove = async () => {

            isOnRemove.value = true

            const deadline = await useTransactionDeadline()
            const account = Web3Connect.getAccount()

            if(!chainId.value || !deadline || !account) {
                isOnRemove.value = false
                throw new Error('missing dependencies')
            }

            const { CURRENCY_A, CURRENCY_B } = burnInfo.parsedAmounts
            const currencyAmountA = CURRENCY_A
            const currencyAmountB = CURRENCY_B

            if (!currencyAmountA || !currencyAmountB) {
                isOnRemove.value = false
                toastError('Error', 'Missing currency amounts')
                throw new Error('missing currency amounts')
            }

            const routerContract = useRouterContract()

            const amountsMin = {
                CURRENCY_A: calculateSlippageAmount(currencyAmountA, allowedSlippage.value)[0],
                CURRENCY_B: calculateSlippageAmount(currencyAmountB, allowedSlippage.value)[0],
            }

            if (!form.currencyA || !form.currencyB) {
                isOnRemove.value = false
                toastError('Error', 'Missing tokens')
                throw new Error('missing tokens')
            }

            const liquidityAmount = burnInfo.parsedAmounts['LIQUIDITY']
            if (!liquidityAmount) {
                isOnRemove.value = false
                toastError('Error', 'Missing liquidity amount')
                throw new Error('missing liquidity amount')
            }

            const currencyBIsBNB = isEther(form.currencyB)
            const oneCurrencyIsBNB = isEther(form.currencyA) || currencyBIsBNB

            if (!form.tokenA || !form.tokenB) {
                isOnRemove.value = false
                toastError('Error', 'Could not wrap')
                throw new Error('could not wrap')
            }

            let methodNames = []
            let args = []

            if(!signatureData.value) {
                isOnRemove.value = false
                toastError('Error', 'Attempting to confirm without approval or a signature')
                throw new Error('Attempting to confirm without approval or a signature')
            }

            if (oneCurrencyIsBNB) {
                methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
                args = [
                    currencyBIsBNB ? form.tokenA.address : form.tokenB.address,
                    liquidityAmount.raw.toString(),
                    amountsMin[currencyBIsBNB ? 'CURRENCY_A' : 'CURRENCY_B'].toString(),
                    amountsMin[currencyBIsBNB ? 'CURRENCY_B' : 'CURRENCY_A'].toString(),
                    account.address,
                    signatureData.value.deadline,
                    false,
                    signatureData.value.v,
                    signatureData.value.r,
                    signatureData.value.s,
                ]
            } else {
                methodNames = ['removeLiquidityWithPermit']
                args = [
                    form.tokenA.address,
                    form.tokenB.address,
                    liquidityAmount.raw.toString(),
                    amountsMin['CURRENCY_A'].toString(),
                    amountsMin['CURRENCY_B'].toString(),
                    account.address,
                    signatureData.value.deadline,
                    false,
                    signatureData.value.v,
                    signatureData.value.r,
                    signatureData.value.s,
                ]
            }

            const safeGasEstimates = await Promise.all(
                methodNames.map(async (methodName) => {
                    let result = undefined
                    try {
                        result = await routerContract.methods[methodName](...args).estimateGas({from: account.address})
                        result = BigNumber.from(result)
                    } catch (error) {
                        console.error(`estimateGas failed`, methodName, args, error)
                    }
                    return result
                })
            )

            const indexOfSuccessfulEstimation = safeGasEstimates.findIndex((safeGasEstimate) =>
                BigNumber.isBigNumber(safeGasEstimate),
            )

            if (indexOfSuccessfulEstimation === -1) {
                isOnRemove.value = false
                toastError('Error', 'This transaction would fail')
                return
            }

            const methodName = methodNames[indexOfSuccessfulEstimation]
            const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation].toString()

            const gasPrice = useGasPrice()

            confirmRemoveLiquidityDialogVisible.value = false
            waitingConfirmRemoveLiquidityDialogVisible.value = true

            await routerContract.methods[methodName](...args).send({
                from: account.address,
                gas: safeGasEstimate,
                gasPrice: gasPrice,
            })
            .on('transactionHash', (transactionHash) => {
                waitingConfirmRemoveLiquidityDialogVisible.value = false
                removeLiquiditySuccessDialogVisible.value = true
                form.transactionHash = transactionHash
            })
            .on('receipt', async () => {
                ElNotification({
                    customClass: 'top-of-every-thing',
                    type: 'success',
                    title: 'Transaction receipt',
                    dangerouslyUseHTMLString: true,
                    message: `<a href="${viewTransactionOnBscUrl(form.transactionHash)}" target="_blank">View on BscScan: ${form.transactionHash}</a>`,
                    duration: 10 * 1000,
                })
                clearForm()
                await Web3Connect.loadBalance()
                isOnRemove.value = false
            })
            .on('error', (error) => {
                waitingConfirmRemoveLiquidityDialogVisible.value = false
                confirmRemoveLiquidityDialogVisible.value = false
                toastError('Error', contractErrorExtract(error.message))
                isOnRemove.value = false
            })   
        }

        const clearForm = () => {
            form.independentField = 'LIQUIDITY_PERCENT'
            form.typedValue = 0
            form.percent = 0
            form.transactionHash = ''
        }

        const clearSignatureData = () => {
            signatureData.value = null
        }

        onMounted(() => {
            loadData()
        })

        return {
            form,
            burnInfo,
            ETHER,
            isLoading,
            isEther,
            receiveAAsWBNB,
            receiveBAsWBNB,
            currencyAToRecieveDisplay,
            currencyBToRecieveDisplay,
            priceOfTokenADisplay,
            priceOfTokenBDisplay,
            onAttemptToApprove,
            canRemove,
            canEnable,
            enableButtonLabel,
            toRemove,
            onRemove,
            confirmRemoveLiquidityDialogVisible,
            waitingConfirmRemoveLiquidityDialogVisible,
            removeLiquiditySuccessDialogVisible,
            isOnRemove,
            allowedSlippage,
            allowedSlippagePercentFormat,
            viewTransactionOnBscUrl,
        }
    }
}
</script>
<style scoped>
</style>