<template>
<div class="Swap flex-center">
    <el-card class="card-fix">
        <div class="flex justify-content-space-between">
            <div>
                <div class="text-x-large text-bold"><el-icon><Sort /></el-icon> Swap</div>
                <div class="text-sm">Trade tokens in an instant</div>
            </div>
            <div class="flex align-items-center">
                <SettingButton></SettingButton>
                <div class="horizontal-space-5"></div>
                <div v-if="state.trade" class="flex align-items-center">
                    {{secondCountdown}}
                    <div class="horizontal-space-2"></div>
                    <el-button @click="refresh" :icon="RefreshLeft" circle />
                </div>
            </div>
        </div>
        <el-divider />
        <div>
            <div class="flex justify-content-space-between align-items-center">
                <SelectTokenButton @selectToken="selectTokenAHandle" :token="form.selectedTokenA" :pairToken="form.selectedTokenB"></SelectTokenButton>
                <div style="margin-right: 12px;">
                    <TokenMiscTools :token="form.selectedTokenA"></TokenMiscTools>
                </div>
                <div class="text-blue">Balance: {{state.tokenABalance ? state.tokenABalance.toSignificant(6) : 0}}</div>
            </div>
            <div class="vertical-space-10"></div>
            <el-input 
            placeholder="0.0"
            oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            @focus="tokenAmountInputFocus('A')" 
            @input="tokenAmountValueChange('A')" 
            v-model="form.tokenAmountA"/>
            <div class="text-align-right">
                <el-button v-show="canMaxTokenA" @click="maxTokenA" link type="primary">Max</el-button>
            </div>
        </div>
        <br/>
        <div class="flex-center">
            <el-button 
            v-if="invertSwapTokenButtonState.isMouseHover"
            @click="invertSwapToken"
            @mouseover="invertSwapTokenButtonState.isMouseHover = true" 
            @mouseleave="invertSwapTokenButtonState.isMouseHover = false"
            :icon="Sort" 
            circle />
            <el-button 
            v-if="!invertSwapTokenButtonState.isMouseHover"
            @mouseover="invertSwapTokenButtonState.isMouseHover = true" 
            @mouseleave="invertSwapTokenButtonState.isMouseHover = false"
            :icon="Bottom" 
            circle />
        </div>
        <br/>
        <div>
            <div class="flex justify-content-space-between align-items-center">
                <SelectTokenButton @selectToken="selectTokenBHandle" :token="form.selectedTokenB" :pairToken="form.selectedTokenA"></SelectTokenButton>
                <div style="margin-right: 12px;">
                    <TokenMiscTools :token="form.selectedTokenB"></TokenMiscTools>
                </div>
                <div class="text-blue">Balance: {{state.tokenBBalance ? state.tokenBBalance.toSignificant(6) : 0}}</div>
            </div>
            <div class="vertical-space-10"></div>
            <el-input 
            placeholder="0.0"
            oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            @focus="tokenAmountInputFocus('B')" 
            @input="tokenAmountValueChange('B')" 
            v-model="form.tokenAmountB"/>
            <div class="text-align-right">
                <el-button v-show="canMaxTokenB" @click="maxTokenB" link type="primary">Max</el-button>
            </div>
        </div>
        <div class="vertical-space-10"></div>
        <div class="flex justify-content-space-between">
            <div class="text-bold">
                Price
            </div>
            <div class="flex align-items-center">
                <div>
                    <TradePrice 
                        :price="state.trade?.executionPrice"
                        @showInvertedChange="(value) => { showInverted = value }">
                    </TradePrice>
                </div>
            </div>
        </div>
        <div class="vertical-space-10"></div>
        <div class="flex justify-content-space-between">
            <div>
                Slippage Tolerance
            </div>
            <div class="text-bold">
                {{ (parseFloat(allowedSlippage) / 100).toFixed(2) }}%
            </div>
        </div>
        <div class="vertical-space-10"></div>
        <div v-if="form.selectedTokenA && form.selectedTokenB">
            <div>
                <ApproveButton 
                customClass="custom-button-100percent"
                @approvalChange="approval => { state.tokenAApproval = approval }"
                :token="form.selectedTokenA" 
                :owner="account.address" 
                :amount="form.tokenAmountA">
                </ApproveButton>
            </div>
            <div class="vertical-space-10"></div>
        </div>
        <div class="vertical-space-10"></div>
        <div>
            <el-button
                v-if="wrapInfo.showWrap"
                @click="wrap"
                :disabled="!isValidWrap"
                class="custom-button-100percent" 
                type="primary">
                    {{ wrapInfo.wrapInputError ?? (wrapInfo.wrapType === WrapType.WRAP ? 'Wrap' : wrapInfo.wrapType === WrapType.UNWRAP ? 'Unwrap' : null) }}
            </el-button>
            <el-button 
                v-else
                @click="toSwap" 
                :disabled="!isValid" 
                class="custom-button-100percent" 
                type="primary">
                    {{submitButtonLabel}}
            </el-button>
        </div>
    </el-card>
    <el-dialog
        v-model="confirmSwapDialogVisible"
        :title="dialogTitle"
        width="50%"
    >
        <div v-if="state.trade">
            <div class="flex justify-content-space-between">
                <div>
                    <h3>{{state.trade.inputAmount.toSignificant(6)}}</h3>
                </div>
                <div class="flex align-items-center">
                    <el-space :size="2">
                        <TokenIcon size="small" :token="state.trade.inputAmount.currency"></TokenIcon>
                        <h3>
                            {{ state.trade.inputAmount.currency.symbol }}
                        </h3>
                    </el-space>
                </div>
            </div>
            <div>
                <el-icon>
                    <Bottom />
                </el-icon>
            </div>
            <div class="flex justify-content-space-between">
                <div>
                    <h3>{{state.trade.outputAmount.toSignificant(6)}}</h3>
                </div>
                <div class="flex align-items-center">
                    <el-space :size="2">
                        <TokenIcon size="small" :token="state.trade.outputAmount.currency"></TokenIcon>
                        <h3>
                            {{ state.trade.outputAmount.currency.symbol }}
                        </h3>
                    </el-space>
                </div>
            </div>
            <div>
                {{ modalTradeInfoText }}
            </div>
            <div v-if="isNeedPriceUpdatedAccept" class="vertical-space-10"></div>
            <div v-if="isNeedPriceUpdatedAccept" class="vertical-space-10"></div>
            <el-card v-if="isNeedPriceUpdatedAccept">
                <div class="flex justify-content-space-between align-items-center">
                    <div class="flex align-items-center">
                        <el-icon>
                            <WarningFilled />
                        </el-icon>
                        <div>
                            Price Updated
                        </div>
                    </div>
                    <div>
                        <el-button @click="acceptPriceUpdated" type="primary">Accept</el-button>
                    </div>
                </div>
            </el-card>
            <div class="vertical-space-10"></div>
            <div class="vertical-space-10"></div>
            <el-card>
                <div class="flex justify-content-space-between">
                    <div>Price</div>
                        <div class="flex align-items-center">
                        <el-space>
                            {{formatExecutionPrice(state.trade, showInverted)}}
                        </el-space>
                        <div>   
                            <el-button @click="revert" :icon="Refresh" size="small" circle />
                        </div>
                    </div>
                </div>
                <div class="vertical-space-10"></div>
                    <div class="flex justify-content-space-between">
                        <div class="flex align-items-center">
                            <div>{{state.trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}}</div>
                            <el-tooltip
                                effect="dark"
                                content="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
                            >
                                <el-icon><QuestionFilled /></el-icon>
                            </el-tooltip>
                        </div>
                        <div class="flex">
                            <el-space :size="2">
                                <div>
                                    {{state.trade.tradeType === TradeType.EXACT_INPUT
                                    ? swapInfo.slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                                    : swapInfo.slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}}
                                </div>
                                <div>
                                    {{state.trade.tradeType === TradeType.EXACT_INPUT
                                    ? state.trade.outputAmount.currency.symbol
                                    : state.trade.inputAmount.currency.symbol}}
                                </div>
                            </el-space>
                        </div>
                    </div>
                    <div class="vertical-space-10"></div>
                    <div class="flex justify-content-space-between">
                        <div class="flex align-items-center">
                            <div>Price Impact</div>
                            <el-tooltip
                                effect="dark"
                                content="The difference between the market price and your price due to trade size."
                            >
                                <el-icon><QuestionFilled /></el-icon>
                            </el-tooltip>
                        </div>
                        <div>
                            <FormattedPriceImpact
                                :priceImpact="swapInfo.priceImpactWithoutFee">
                            </FormattedPriceImpact>
                        </div>
                    </div>
                    <div class="vertical-space-10"></div>
                    <div class="flex justify-content-space-between">
                        <div class="flex align-items-center">
                            <div>Liquidity Provider Fee</div>
                            <el-tooltip
                                effect="dark">
                                <template #content> 
                                    <div>
                                        For each trade a 0.25% fee is paid
                                    </div>
                                    <div>
                                        - 0.17% to LP token holders
                                    </div>
                                    <div>
                                        - 0.03% to the Treasury
                                    </div>
                                    <div>
                                        - 0.05% towards CAKE buyback and burn
                                    </div>
                                </template>
                                <el-icon><QuestionFilled /></el-icon>
                            </el-tooltip>
                        </div>
                        <div>{{swapInfo.realizedLPFee ? `${swapInfo.realizedLPFee.toSignificant(6)} ${state.trade.inputAmount.currency.symbol}` : '-'}}</div>
                    </div>
            </el-card>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button 
                    class="custom-button-100percent" 
                    type="primary" 
                    :disabled="onSwap || isNeedPriceUpdatedAccept" 
                    @click="swap">{{onSwap ? 'Supplying' : 'Confirm Swap'}}
                </el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog
        v-model="waitingConfirmSwapDialogVisible"
        title="Confirm Swap"
        width="50%"
    >
        <div v-if="form.selectedTokenA && form.selectedTokenA" class="text-align-center">
            <h1>Waiting For Confirmation</h1>
            <h3>
                Swapping 
                {{state.trade?.inputAmount?.toSignificant(6)}} 
                {{state.trade?.inputAmount?.currency?.symbol}} 
                for 
                {{state.trade?.outputAmount?.toSignificant(6)}} 
                {{state.trade?.outputputAmount?.currency?.symbol}} 
            </h3>
            <h4>Confirm this transaction in your wallet</h4>
        </div>
    </el-dialog>
    <el-dialog
        v-model="swapSuccessDialogVisible"
        title="Confirm Swap"
        width="50%"
    >
        <div class="text-align-center">
            <h1>Transaction Submitted</h1>
            <h3><a :href="viewTransactionOnBscUrl(form.transactionHash)" target="_blank">View on BscScan</a></h3>
            <el-button @click="swapSuccessDialogVisible = false" type="primary">Close</el-button>
        </div>
    </el-dialog>
</div>   
</template>
<script>

import SettingButton from '@/components/SettingButton'
import { reactive, computed, watch, toRaw, ref, onMounted, onBeforeUnmount } from 'vue'
import SelectTokenButton from '@/components/SelectTokenButton'
import { Bottom, Refresh, QuestionFilled, WarningFilled, RefreshLeft, Sort } from '@element-plus/icons-vue'
import useWeb3Connect from '@/use/Web3Connect'
import { isEther } from '@/lib/utils.js'
import { wrappedCurrencyAmount } from '@/utils/wrappedCurrency'
import { CurrencyAmount, TokenAmount, TradeType, ETHER } from '@pancakeswap/sdk'
import useERC20 from '@/use/ERC20'
import ApproveButton from '@/components/ApproveButton'
import validator from 'validator'
import { useDerivedSwapInfo } from '@/state/swap/hook'
import { Field } from '@/state/swap/actions'
import TradePrice from '@/components/swap/TradePrice'
import { useSwapCallArguments } from '@/use/SwapCallArguments'
import { useUserSlippageTolerance, useGasPrice } from '@/state/user/hook'
import { BigNumber } from '@ethersproject/bignumber'
import { useRouterContract } from '@/use/Contract'
import { toastError } from '@/use/Toast'
import contractErrorExtract from '@/lib/contractErrorExtract'
import TokenIcon from '@/components/TokenIcon'
import { formatExecutionPrice, computeTradePriceBreakdown } from '@/utils/prices'
import { viewTransactionOnBscUrl } from '@/lib/utils.js'
import { ElNotification } from 'element-plus'
import FormattedPriceImpact from '@/components/swap/FormattedPriceImpact'
import SmartInterval from '@/lib/SmartInterval'
import { FETCH_PRICE_INTERVAL } from '@/constant/Values'
import { useWrapCallback, WrapType } from '@/use/WrapCallback'
import TokenMiscTools from '@/components/TokenMiscTools'
import { useCurrency } from '@/use/Tokens'
import { useRoute } from 'vue-router'
import { getPrimaryTokens } from '@/use/TokenList'

export default {
    components: {
        SettingButton,
        SelectTokenButton,
        Bottom,
        ApproveButton,
        TradePrice,
        TokenIcon,
        QuestionFilled,
        FormattedPriceImpact,
        WarningFilled,
        TokenMiscTools,
        Sort
    },
    setup() {

        const Web3Connect = useWeb3Connect()
        const ERC20 = useERC20()
        const route = useRoute()
        let smartInterval = null
        let smartIntervalCountdown = null
        let latestOutputAmount = null

        const account = Web3Connect.account
        const chainId = Web3Connect.chainId

        const [ allowedSlippage ] = useUserSlippageTolerance()

        const form = reactive({
            selectedTokenA: null,
            selectedTokenB: null,
            tokenAmountA: '',
            tokenAmountB: '',
            transactionHash: '',
        })

        const state = reactive({
            tokenABalance: null,
            tokenBBalance: null,
            tokenAmountInputFocusOn: 'A', //A, B
            tokenAmountInputValueChangeOn: 'A', //A, B
            tokenAApproval: false,
            trade: null,
        })

        const swapInfo = reactive({
            currencyBalances: null,
            currencies: null,
            slippageAdjustedAmounts: null,
            priceImpactWithoutFee: null,
            realizedLPFee: null,
        })

        const invertSwapTokenButtonState = reactive({
            isMouseHover: false,
            isInvert: false,
        })

        const swapInputErrorMessage = ref('')
        const confirmSwapDialogVisible = ref(false)
        const waitingConfirmSwapDialogVisible = ref(false)
        const swapSuccessDialogVisible = ref(false)
        const onSwap = ref(false)
        const showInverted = ref(false)
        const isNeedPriceUpdatedAccept = ref(false)
        const secondCountdown = ref(-1)

        const wrapInfo = reactive({
            wrapInputError: '',
            wrapType: WrapType.NOT_APPLICABLE,
            onWrap: null,
            showWrap: false,
            isOnWrap: false,
        })

        const isValid = computed(() => {
            return !swapInputErrorMessage.value 
            && state.tokenAApproval 
            && !onSwap.value
            && !noRoute.value
        })

        const isValidWrap = computed(() => {
            return !wrapInfo.wrapInputError 
            && state.tokenAApproval 
            && !wrapInfo.isOnWrap
        })

        const independentToken = computed(() => {
            let independentToken = 'A'
            if(state.tokenAmountInputFocusOn === 'A' && state.tokenAmountInputValueChangeOn === 'A') {
                independentToken = 'A'
            } else if(state.tokenAmountInputFocusOn === 'B' && state.tokenAmountInputValueChangeOn === 'B') {
                independentToken = 'B'
            }
            return independentToken
        })

        // const independentCurrency = computed(() => {
        //     if(independentToken.value === 'A') {
        //         return form.selectedTokenA
        //     } else if(independentToken.value === 'B') {
        //         return form.selectedTokenB
        //     } else {
        //         return 0
        //     }
        // })

        const independentAmount = computed(() => {
            if(independentToken.value === 'A') {
                return form.tokenAmountA
            } else if(independentToken.value === 'B') {
                return form.tokenAmountB
            } else {
                return 0
            }
        })

        const independentField = computed(() => {
            if(independentToken.value === 'A') {
                return 'INPUT'
            } else if(independentToken.value === 'B') {
                return 'OUTPUT'
            } else {
                return 'INPUT'
            }
        })

        const typedValue = computed(() => {
            return independentAmount.value
        })

        const canMaxTokenA = computed(() => {
            if(!state.tokenABalance) {
                return false
            }
            if(!form.tokenAmountA) {
                return true
            }
            return parseFloat(form.tokenAmountA) < parseFloat(state.tokenABalance.toSignificant(6))
        })

        const canMaxTokenB = computed(() => {
            if(!state.tokenBBalance) {
                return false
            }
            if(!form.tokenAmountB) {
                return true
            }
            return parseFloat(form.tokenAmountB) < parseFloat(state.tokenBBalance.toSignificant(6))
        })

        const submitButtonLabel = computed(() => {
            if(!isValid.value) {
                if(swapInputErrorMessage.value) {
                    return swapInputErrorMessage.value
                } else if(noRoute.value && (form.tokenAmountA || form.tokenAmountB)) {
                    return 'Insufficient liquidity for this trade'
                } else {
                    return 'Swap'
                }
            } else {
                return 'Swap'
            }
        })

        const dialogTitle = computed(() => {
            return 'Confirm Swap'
        })

        const modalAmount = computed(() => {
            return state.trade.tradeType === TradeType.EXACT_INPUT
            ? swapInfo.slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)
            : swapInfo.slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)
        })
        const modalSymbol = computed(() => {
            return state.trade.tradeType === TradeType.EXACT_INPUT 
            ? state.trade.outputAmount.currency.symbol 
            : state.trade.inputAmount.currency.symbol
        })
        const modalTradeInfoText = computed(() => {
            return state.trade.tradeType === TradeType.EXACT_INPUT
            ? `Output is estimated. You will receive at least ${modalAmount.value} ${modalSymbol.value} or the transaction will revert.`
            : `Input is estimated. You will sell at most ${modalAmount.value} ${modalSymbol.value} or the transaction will revert.`
        })

        const noRoute = computed(() => {
            return !state.trade
        })

        watch(() => form.selectedTokenA, async (newVal) => {
            calculateAmountToSwap()
            state.tokenABalance = await getTokenBalance(newVal)
        })

        watch(() => form.selectedTokenB, async (newVal) => {
            calculateAmountToSwap()
            state.tokenBBalance = await getTokenBalance(newVal)
        })

        const refreshTokenBalance = async () => {
            state.tokenABalance = await getTokenBalance(form.selectedTokenA)
            state.tokenBBalance = await getTokenBalance(form.selectedTokenB)
        }

        const selectTokenAHandle = (token) => {
            form.selectedTokenA = token
        }

        const selectTokenBHandle = (token) => {
            form.selectedTokenB = token
        }

        const tokenAmountInputFocus = (tokenKey) => {
            state.tokenAmountInputFocusOn = tokenKey
        }

        const tokenAmountValueChange = (tokenKey) => {
            state.tokenAmountInputValueChangeOn = tokenKey
            calculateAmountToSwap()
        }

        const maxTokenA = () => {
            form.tokenAmountA = state.tokenABalance.toSignificant(6)
            tokenAmountInputFocus('A')
            tokenAmountValueChange('A')
        }

        const maxTokenB = () => {
            form.tokenAmountB = state.tokenBBalance.toSignificant(6)
            tokenAmountInputFocus('B')
            tokenAmountValueChange('B')
        }

        const getTokenBalance = async (token) => { 
            if(!account.value.address) {
                return 0
            }
            if(isEther(token)) {
                return wrappedCurrencyAmount(CurrencyAmount.ether(account.value.balance.toString()), chainId.value)
            } else {
                const balance = await ERC20.balanceOf(token.address, account.value.address)
                return new TokenAmount(token, balance)
            }
        }

        const calculateAmountToSwap = async () => {

            if(!independentAmount.value) {
                clearForm()
                return
            }
            if(parseFloat(independentAmount.value) === 0) {
                return
            }
            if(!validator.isNumeric(independentAmount.value)) {
                return
            }

            const {
                v2Trade,
                currencyBalances,
                parsedAmount,
                currencies,
                slippageAdjustedAmounts,
                inputError: swapInputError,
            } = await useDerivedSwapInfo(
                independentField.value, 
                independentAmount.value, 
                toRaw(form.selectedTokenA), 
                toRaw(form.selectedTokenB)
            )
            swapInfo.currencyBalances = currencyBalances
            swapInfo.currencies = currencies
            swapInfo.slippageAdjustedAmounts = slippageAdjustedAmounts
            swapInputErrorMessage.value = swapInputError

            const {
                wrapType,
                execute: onWrap,
                inputError: wrapInputError,
            } = await useWrapCallback(toRaw(form.selectedTokenA), toRaw(form.selectedTokenB), typedValue.value)
            wrapInfo.wrapType = wrapType
            wrapInfo.onWrap = onWrap
            wrapInfo.wrapInputError = wrapInputError

            const showWrap = wrapType !== WrapType.NOT_APPLICABLE
            wrapInfo.showWrap = showWrap
            const trade = showWrap ? undefined : v2Trade
            state.trade = trade

            if(latestOutputAmount && state.trade && latestOutputAmount?.toSignificant(6) !== state.trade?.outputAmount.toSignificant(6)) {
                isNeedPriceUpdatedAccept.value = true
            }
            latestOutputAmount = state.trade?.outputAmount

            const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
            swapInfo.priceImpactWithoutFee = priceImpactWithoutFee
            swapInfo.realizedLPFee = realizedLPFee

            const parsedAmounts = showWrap
                ? {
                    [Field.INPUT]: parsedAmount,
                    [Field.OUTPUT]: parsedAmount,
                }
                : {
                    [Field.INPUT]: independentField.value === Field.INPUT ? parsedAmount : trade?.inputAmount,
                    [Field.OUTPUT]: independentField.value === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
                }

            const dependentField = independentField.value === Field.INPUT ? Field.OUTPUT : Field.INPUT

            const formattedAmounts = {
                [independentField.value]: typedValue.value,
                [dependentField]: showWrap
                ? parsedAmounts[independentField.value]?.toExact() ?? ''
                : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
            }

            form.tokenAmountA = formattedAmounts[Field.INPUT]
            form.tokenAmountB = formattedAmounts[Field.OUTPUT]

            if(showWrap) {
                return
            }

            if(smartInterval) {
                if(smartInterval.stopped) {
                    smartInterval.start()
                }
                if(smartIntervalCountdown.stopped) {
                    smartIntervalCountdown.start()
                }
            } else {
                secondCountdown.value = FETCH_PRICE_INTERVAL / 1000
                smartInterval = SmartInterval(() => {
                    calculateAmountToSwap()
                }, FETCH_PRICE_INTERVAL)
                smartIntervalCountdown = SmartInterval(() => {
                    if(secondCountdown.value === 0) {
                        secondCountdown.value = FETCH_PRICE_INTERVAL / 1000
                        return
                    }
                    secondCountdown.value -= 1
                }, 1000)
            }
        }

        const clearForm = () => {
            form.tokenAmountA = ''
            form.tokenAmountB = ''
            form.transactionHash = ''
            state.trade = null
            if(smartInterval) {
                smartInterval.stop()
            }
            if(smartIntervalCountdown) {
                smartIntervalCountdown.stop()
            }
        }

        const toSwap = () => {
            isNeedPriceUpdatedAccept.value = false
            confirmSwapDialogVisible.value = true
        }

        const revert = () => {
            showInverted.value = !showInverted.value
        }

        const swap = async () => {

            onSwap.value = true

            const gasPrice = useGasPrice()
            const trade = toRaw(state.trade)
            const to = account.value.address

            const swapCalls = await useSwapCallArguments(trade, allowedSlippage, to)

            const routerContract = useRouterContract()
            
            const safeGasEstimates = await Promise.all(
                swapCalls.map(async (call) => {

                    const { methodName, args, value } = call

                    let result = undefined
                    try {
                        result = await routerContract.methods[methodName](...args).estimateGas({
                            ...(value ? { value } : {}),
                            from: account.value.address
                        })
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
                onSwap.value = false
                toastError('Error', 'This transaction would fail')
                return
            }

            const methodName = swapCalls[indexOfSuccessfulEstimation]['methodName']
            const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation].toString()
            const args = swapCalls[indexOfSuccessfulEstimation]['args']
            const value = swapCalls[indexOfSuccessfulEstimation]['value']

            confirmSwapDialogVisible.value = false
            waitingConfirmSwapDialogVisible.value = true

            routerContract.methods[methodName](...args).send({
                ...(value ? { value } : {}),
                from: account.value.address,
                gas: safeGasEstimate,
                gasPrice: gasPrice,
            })
            .on('transactionHash', (transactionHash) => {
                waitingConfirmSwapDialogVisible.value = false
                swapSuccessDialogVisible.value = true
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
                await refreshTokenBalance()
                onSwap.value = false
            })
            .on('error', (error) => {
                waitingConfirmSwapDialogVisible.value = false
                confirmSwapDialogVisible.value = false
                toastError('Error', contractErrorExtract(error.message))
                onSwap.value = false
            })
        }

        const acceptPriceUpdated = async () => {
            isNeedPriceUpdatedAccept.value = false
        }

        const refresh = () => {
            calculateAmountToSwap()
        }

        const wrap = async () => {
            wrapInfo.isOnWrap = true
            await wrapInfo.onWrap()
            clearForm()
            await Web3Connect.loadBalance()
            await refreshTokenBalance()
            wrapInfo.isOnWrap = false
        }

        const invertSwapToken = () => {

            let tmpSelectedToken = null
            let tmpTokenAmount = null

            if(state.tokenAmountInputFocusOn === 'A') {
                state.tokenAmountInputFocusOn = 'B'
                state.tokenAmountInputValueChangeOn = 'B'
            } else {
                state.tokenAmountInputFocusOn = 'A'
                state.tokenAmountInputValueChangeOn = 'A'
            }

            if(form.selectedTokenA) {
                tmpSelectedToken = form.selectedTokenB
                tmpTokenAmount = form.tokenAmountB
                form.selectedTokenB = form.selectedTokenA
                form.tokenAmountB = form.tokenAmountA
            }
            if(form.selectedTokenB) {
                form.selectedTokenA = tmpSelectedToken
                form.tokenAmountA = tmpTokenAmount
            }
        }

        const loadOutputCurrency = async () => {
            if(route.query.outputCurrency) {
                const outputCurrency = await useCurrency(route.query.outputCurrency)
                form.selectedTokenB = outputCurrency
                form.selectedTokenA = ETHER
            }
        }

        onMounted(async () => {
            await getPrimaryTokens()
            await loadOutputCurrency()
        })

        onBeforeUnmount(() => {
            if(smartInterval) {
                smartInterval.stop()
            }
            if(smartIntervalCountdown) {
                smartIntervalCountdown.stop()
            }
        })

        return {
            account,
            form,
            state,
            swapInfo,
            canMaxTokenA,
            canMaxTokenB,
            selectTokenAHandle,
            selectTokenBHandle,
            tokenAmountInputFocus,
            tokenAmountValueChange,
            maxTokenA,
            maxTokenB,
            submitButtonLabel,
            swapInputErrorMessage,
            isValid,
            toSwap,
            swap,
            onSwap,
            dialogTitle,
            confirmSwapDialogVisible,
            waitingConfirmSwapDialogVisible,
            swapSuccessDialogVisible,
            modalAmount,
            modalSymbol,
            modalTradeInfoText,
            TradeType,
            Field,
            formatExecutionPrice,
            showInverted,
            revert,
            Refresh,
            RefreshLeft,
            viewTransactionOnBscUrl,
            acceptPriceUpdated,
            isNeedPriceUpdatedAccept,
            secondCountdown,
            refresh,
            wrapInfo,
            WrapType,
            isValidWrap,
            wrap,
            invertSwapTokenButtonState,
            Sort,
            Bottom,
            invertSwapToken,
            allowedSlippage,
        }
    }
}
</script>