<template>
    <div class="AddLiquidity flex-center">
        <el-card class="card-fix">
            <div class="flex align-items-center">
                <el-space>
                    <router-link :to="{name: 'Liquidity'}">
                        <el-button :icon="Back" circle></el-button>
                    </router-link>
                    <div>
                        <div class="text-x-large text-bold">Add Liquidity</div>
                        <!--<div class="vertical-space-10"></div>-->
                        <div class="flex">

                            <div class="text-sm">Add liquidity to receive LP tokens</div>
                            <el-tooltip
                                    effect="dark"
                                    content="Liquidity providers earn a 0.17% trading fee on all trades made for that token pair, proportional to their share of the liquidity pool."
                            >
                                <el-icon><QuestionFilled /></el-icon>
                            </el-tooltip>
                        </div>
                    </div>
                </el-space>
            </div>
            <el-divider />
            <div v-if="noLiquidity">
                <div>You are the first liquidity provider.</div>
                <div>The ratio of tokens you add will set the price of this pool.</div>
                <div>Once you are happy with the rate click supply to review.</div>
                <br>
            </div>
            <div>
                <div class="flex justify-content-space-between align-items-center">
                    <SelectTokenButton @selectToken="selectTokenAHandle" :token="selectedTokenA" :pairToken="selectedTokenB"></SelectTokenButton>
                    <div style="margin-right: 12px;">
                        <TokenMiscTools :token="selectedTokenA"></TokenMiscTools>
                    </div>
                    <div class="text-blue">Balance: {{tokenABalance ? tokenABalance.toSignificant(6) : 0}}</div>
                </div>
                <div class="vertical-space-10"></div>
                <el-input 
                placeholder="0.0"
                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                @focus="toAddAmountTokenFocus('A')" 
                @input="toAddAmountValueChange('A')" 
                v-model="toAddAmountTokenA"/>
                <div class="text-align-right">
                    <el-button v-show="canMaxTokenA" @click="maxTokenA" link type="primary">Max</el-button>
                </div>
            </div>
            <div class="text-align-center">+</div>
            <br/>
            <div>
                <div class="flex justify-content-space-between align-items-center">
                    <SelectTokenButton @selectToken="selectTokenBHandle" :token="selectedTokenB" :pairToken="selectedTokenA"></SelectTokenButton>
                    <div style="margin-right: 12px;">
                        <TokenMiscTools :token="selectedTokenB"></TokenMiscTools>
                    </div>
                    <div class="text-blue">Balance: {{tokenBBalance ? tokenBBalance.toSignificant(6) : 0}}</div>
                </div>
                <div class="vertical-space-10"></div>
                <el-input 
                placeholder="0.0"
                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                @focus="toAddAmountTokenFocus('B')" 
                @input="toAddAmountValueChange('B')" 
                v-model="toAddAmountTokenB"/>
                <div class="text-align-right">
                    <el-button v-show="canMaxTokenB" @click="maxTokenB" link type="primary">Max</el-button>
                </div>
            </div>

            <div class="price-card" v-if="selectedTokenA && selectedTokenB" style="margin-top: 10px;">
                <div>
                    Prices and pool share
                </div>
                <div class="vertical-space-10"></div>
                <div class="flex justify-content-space-around">
                    <el-space size="large">
                        <div class="text-align-center">
                            <div>{{priceBPerA || '-'}}</div>
                            <div>{{selectedTokenB.symbol}} per {{selectedTokenA.symbol}}</div>
                        </div>
                        <div class="text-align-center">
                            <div>{{priceAPerB || '-'}}</div>
                            <div>{{selectedTokenA.symbol}} per {{selectedTokenB.symbol}}</div>
                        </div>
                        <div class="text-align-center">
                            <div>{{poolTokenPercentageFormat(poolTokenPercentage)}}%</div>
                            <div>Share of Pool</div>
                        </div>
                    </el-space>
                </div>
            </div>

            <div v-if="selectedTokenA && selectedTokenB">
                <div>
                    <ApproveButton 
                    customClass="custom-button-100percent"
                    @approvalChange="approval => { tokenAApproval = approval }"
                    :token="selectedTokenA" 
                    :owner="account.address" 
                    :amount="toAddAmountTokenA">
                    </ApproveButton>
                </div>
                <div class="vertical-space-10"></div>
                <div>
                    <ApproveButton 
                    customClass="custom-button-100percent"
                    @approvalChange="approval => { tokenBApproval = approval }"
                    :token="selectedTokenB" 
                    :owner="account.address" 
                    :amount="toAddAmountTokenB">
                    </ApproveButton>
                </div>
                <div class="vertical-space-10"></div>
                <div>
                    <el-button class="custom-button-100percent" :disabled="!canSupply || onSupply" @click="toSupply" type="primary">{{supplyButtonLabel}}</el-button>
                </div>
            </div>

            <div style="margin-top: 15px;">
                <LiquidityCardPreview v-if="state.pair" :pair="state.pair"></LiquidityCardPreview>
            </div>
        </el-card>
        

        <el-dialog
            v-model="confirmAddLiquidityDialogVisible"
            :title="dialogTitle"
            width="50%"
        >
            <div>
                <div class="flex align-items-center">
                    <el-space>
                        <div v-if="liquidityMinted" class="text-xx-large text-bold">{{liquidityMinted.toSignificant(6)}}</div>
                        <el-space :size="2">
                            <TokenIcon :token="selectedTokenA"></TokenIcon>
                            <TokenIcon :token="selectedTokenB"></TokenIcon>
                        </el-space>
                    </el-space>
                </div>
                <div class="vertical-space-10"></div>
                <div class="text-large text-bold">{{selectedTokenA.symbol}}/{{selectedTokenB.symbol}} 
                    <span v-if="!noLiquidity">Pool Tokens</span>
                </div>

                <div v-if="!noLiquidity" style="margin-bottom: 15px;">
                    Output is estimated. If the price changes by more than {{allowedSlippagePercentFormat(allowedSlippage)}}% your transaction will revert.
                </div>

                <div>
                    <div class="flex justify-content-space-between">
                        <div><strong>{{selectedTokenA.symbol}} Deposited</strong></div>
                        <div class="flex align-items-center">
                            <el-space :size="2">
                                <TokenIcon :size="18" :token="selectedTokenA"></TokenIcon>
                            </el-space>
                            <div>{{toAddAmountTokenA}}</div>
                        </div>
                    </div>
                    <div class="flex justify-content-space-between">
                        <div><strong>{{selectedTokenB.symbol}} Deposited</strong></div>
                        <div class="flex align-items-center">
                            <el-space :size="2">
                                <TokenIcon :size="18" :token="selectedTokenB"></TokenIcon>
                            </el-space>
                            <div>{{toAddAmountTokenB}}</div>
                        </div>
                    </div>
                    <div class="flex justify-content-space-between">
                        <div><strong>Rates</strong></div>
                        <div>1 {{selectedTokenA.symbol}} = {{priceBPerA}} {{selectedTokenB.symbol}}</div>
                    </div>
                    <div class="flex justify-content-space-between">
                        <div></div>
                        <div>1 {{selectedTokenB.symbol}} = {{priceAPerB}} {{selectedTokenA.symbol}}</div>
                    </div>
                    <div class="flex justify-content-space-between">
                        <div><strong>Share of Pool:</strong></div>
                        <div>{{poolTokenPercentageFormat(poolTokenPercentage)}}%</div>
                    </div>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button class="custom-button-100percent" type="primary" :disabled="onSupply" @click="supply">{{onSupply ? 'Supplying' : noLiquidity ? 'Create Pool & Supply' :'Confirm Supply'}}</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog
            v-model="waitingConfirmAddLiquidityDialogVisible"
            :title="dialogTitle"
            width="50%"
        >
            <div class="text-align-center">
                <h1>Waiting For Confirmation</h1>
                <h3>Suppling {{toAddAmountTokenA}} {{selectedTokenA.symbol}} and {{toAddAmountTokenB}} {{selectedTokenB.symbol}}</h3>
                <h4>Confirm this transaction in your wallet</h4>
            </div>
        </el-dialog>
        <el-dialog
            v-model="addLiquiditySuccessDialogVisible"
            :title="dialogTitle"
            width="50%"
        >
            <div class="text-align-center">
                <h1>Transaction Submitted</h1>
                <h3><a :href="viewAddLiquidityTransactionURL" target="_blank">View on BscScan</a></h3>
                <AddTokenButton v-if="state.pair?.liquidityToken" :token="state.pair.liquidityToken"></AddTokenButton>
                <el-button @click="addLiquiditySuccessDialogVisible = false" type="primary">Close</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>

import { Price, TokenAmount, Percent, JSBI, ETHER, CurrencyAmount } from '@pancakeswap/sdk'
import useERC20 from '@/use/ERC20.js'
import ApproveButton from '@/components/ApproveButton'
import usePair from '@/use/Pair.js'
import contractErrorExtract from '@/lib/contractErrorExtract.js'
import { 
    allowedSlippagePercentFormat ,
    numberFormat,
    poolTokenPercentageFormat,
} from '@/lib/utils.js'
import PAIR_STATE from '@/constant/PairState'
import IRouter02 from '@/constant/abi/IRouter02.json'
import { ROUTER_ADDRESS } from '@/constant/config/Contract.js'
import { BIG_INT_ZERO } from '@/constant/Exchange'
import validator from 'validator'
import { parseUnits } from '@ethersproject/units'
import { ElNotification } from 'element-plus'
import AddTokenButton from '@/components/AddTokenButton'
import { ref, computed, watch, reactive, onMounted, onBeforeUnmount, toRaw } from 'vue'
import { useUserSlippageTolerance, useGasPrice } from '@/state/user/hook'
import useWeb3Connect from '@/use/Web3Connect'
import { viewTransactionOnBscUrl, isEther } from '@/lib/utils.js'
import useTotalSupply from '@/use/TotalSupply'
import useTransactionDeadline from '@/use/TransactionDeadline'
import { calculateSlippageAmount } from '@/utils/exchange'
import useParseSdkEntity from '@/use/ParseSdkEntity'
import { Back, QuestionFilled } from '@element-plus/icons-vue'
import SelectTokenButton from '@/components/SelectTokenButton'
import LiquidityCardPreview from '@/components/LiquidityCardPreview'
import { wrappedCurrencyAmount, wrappedCurrency } from '@/utils/wrappedCurrency'
import { BigNumber } from '@ethersproject/bignumber'
import TokenIcon from '@/components/TokenIcon'
import SmartInterval from '@/lib/SmartInterval'
import { FETCH_PRICE_INTERVAL } from '@/constant/Values'
import { useCurrency } from '@/use/Tokens'
import { useRoute, useRouter } from 'vue-router'
import { getPrimaryTokens } from '@/use/TokenList'
import { getCurrencyAddress } from '@/utils'
import TokenMiscTools from '@/components/TokenMiscTools'

export default {
    components: {
        ApproveButton,
        AddTokenButton,
        QuestionFilled,
        SelectTokenButton,
        LiquidityCardPreview,
        TokenIcon,
        TokenMiscTools,
    },
    setup() {
        
        const ERC20 = useERC20()
        const PairHook = usePair()
        const Web3Connect = useWeb3Connect()
        const chainId = Web3Connect.chainId
        const ParseSdkEntity = useParseSdkEntity()
        const route = useRoute()
        const router = useRouter()
        let smartInterval = null
        
        const [ allowedSlippage ] = useUserSlippageTolerance()
        const account = Web3Connect.account
        const tokens = ref([])
        const toAddAmountTokenA = ref('')
        const toAddAmountTokenB = ref('')
        const selectedTokenA = ref(null)
        const selectedTokenB = ref(null)
        const priceBPerA = ref(0)
        const priceAPerB = ref(0)
        const toAddAmountInputFocusOn = ref('') //A, B
        const toAddAmountValueChangeOn = ref('') //A, B
        const tokenABalance = ref(null)
        const tokenBBalance = ref(null)
        const poolTokenPercentage = ref(0)
        const noLiquidity = ref(false)
        const totalSupply = ref(null)
        const liquidityMinted = ref(null)
        const confirmAddLiquidityDialogVisible = ref(false)
        const waitingConfirmAddLiquidityDialogVisible = ref(false)
        const addLiquiditySuccessDialogVisible = ref(false)
        const tokenAApproval = ref(false)
        const tokenBApproval = ref(false)
        const onSupply = ref(false)
        const addLiquidityTransactionHash = ref('')
        const isLoading = ref(false)

        const state = reactive({
            pair: null,
        })

        const independentToken = computed(() => {
            let independentToken = 'A'
            if(toAddAmountInputFocusOn.value === 'A' && toAddAmountValueChangeOn.value === 'A') {
                independentToken = 'A'
            } else if(toAddAmountInputFocusOn.value === 'B' && toAddAmountValueChangeOn.value === 'B') {
                independentToken = 'B'
            }
            return independentToken
        })

        const independentCurrency = computed(() => {
            if(independentToken.value === 'A') {
                return selectedTokenA.value
            } else if(independentToken.value === 'B') {
                return selectedTokenB.value
            } else {
                return 0
            }
        })

        const independentAmount = computed(() => {
            if(independentToken.value === 'A') {
                return toAddAmountTokenA.value
            } else if(independentToken.value === 'B') {
                return toAddAmountTokenB.value
            } else {
                return 0
            }
        })

        const canSupply = computed(() => {

            const balanceA = (tokenABalance.value) ? parseFloat(tokenABalance.value.toSignificant(6)) : 0
            const balanceB = (tokenBBalance.value) ? parseFloat(tokenBBalance.value.toSignificant(6)) : 0

            if(parseFloat(toAddAmountTokenA.value) === 0 || parseFloat(toAddAmountTokenB.value) === 0) {
                return false
            }
            if(parseFloat(toAddAmountTokenA.value) <= balanceA && 
            parseFloat(toAddAmountTokenB.value) <= balanceB && 
            tokenAApproval.value && 
            tokenBApproval.value
            ) {
                return true
            } else {
                return false
            }
        })

        const supplyButtonLabel = computed(() => {

            if(onSupply.value) {
                return 'Supplying'
            }
            if(canSupply.value) {
                return 'Supply'
            }
            const balanceA = (tokenABalance.value) ? parseFloat(tokenABalance.value.toSignificant(6)) : 0
            const balanceB = (tokenBBalance.value) ? parseFloat(tokenBBalance.value.toSignificant(6)) : 0

            if(parseFloat(toAddAmountTokenA.value) > balanceA) {
                return `Insufficient ${selectedTokenA.value.symbol} balance`
            }
            if(parseFloat(toAddAmountTokenB.value) > balanceB) {
                return `Insufficient ${selectedTokenB.value.symbol} balance`
            }
            return 'Supply'
        })

        const canMaxTokenA = computed(() => {
            if(!tokenABalance.value) {
                return false
            }
            if(!toAddAmountTokenA.value) {
                return true
            }
            return parseFloat(toAddAmountTokenA.value) < parseFloat(tokenABalance.value.toSignificant(6))
        })

        const canMaxTokenB = computed(() => {
            if(!tokenBBalance.value) {
                return false
            }
            if(!toAddAmountTokenB.value) {
                return true
            }
            return parseFloat(toAddAmountTokenB.value) < parseFloat(tokenBBalance.value.toSignificant(6))
        })

        const viewAddLiquidityTransactionURL = computed(() => {
            return viewTransactionOnBscUrl(addLiquidityTransactionHash.value)
        })

        const dialogTitle = computed(() => {
            return noLiquidity.value ? 'You are creating a pool' : 'You will receive'
        })

        watch(() => selectedTokenA.value, async (newVal) => {
            calculateAmountToAdd()
            tokenABalance.value = await getTokenBalance(newVal)
        })

        watch(() => selectedTokenB.value, async (newVal) => {
            calculateAmountToAdd()
            tokenBBalance.value = await getTokenBalance(newVal)
        })

        watch(() => route.params.tokenAAddress, () => {
            loadSelectedToken()
        })
        watch(() => route.params.tokenBAddress, () => {
            loadSelectedToken()
        })
        
        const toAddAmountTokenFocus = (tokenKey) => {
            toAddAmountInputFocusOn.value = tokenKey
        }

        const toAddAmountValueChange = (tokenKey) => {
            toAddAmountValueChangeOn.value = tokenKey
            calculateAmountToAdd()
        }

        const updateRoute = (tokenA, tokenB) => {
            const tokenAaddress = getCurrencyAddress(tokenA)
            const tokenBaddress = getCurrencyAddress(tokenB)
            router.push({
                name: 'AddLiquidity', 
                params: {
                    tokenAAddress: tokenAaddress, 
                    tokenBAddress: tokenBaddress
                }
            })
        }

        const selectTokenAHandle = (value) => {
            updateRoute(value, selectedTokenB.value)
        }
        const selectTokenBHandle = (value) => {
            updateRoute(selectedTokenA.value, value)
        }

        const calculateAmountToAdd = async () => {

            const calculateDependentAmount = () => {

                const independentTokenAmount = ParseSdkEntity.fastCreateTokenAmount(independentCurrency.value, independentAmount.value.toString())

                const dependentToken = independentToken.value === 'A' ? tokenA : tokenB

                const dependentAmount = pair.priceOf(dependentToken).quote(independentTokenAmount)

                if(independentToken.value === 'A') {
                    if(toAddAmountTokenB.value === ETHER) {
                        toAddAmountTokenB.value = CurrencyAmount.ether(dependentAmount.raw).toSignificant(6)
                    } else {
                        toAddAmountTokenB.value = dependentAmount.toSignificant(6)
                    }
                } else if(independentToken.value === 'B') {
                    if(toAddAmountTokenA.value === ETHER) {
                        toAddAmountTokenA.value = CurrencyAmount.ether(dependentAmount.raw).toSignificant(6)
                    } else {
                        toAddAmountTokenA.value = dependentAmount.toSignificant(6)
                    }
                }
            }

            const calculatePrice = () => {
                const toAddAmountTokenAParsed = parseUnits(toAddAmountTokenA.value.toString(), tokenA.decimals)
                const toAddAmountTokenBParsed = parseUnits(toAddAmountTokenB.value.toString(), tokenB.decimals)
                const price = new Price(tokenA, tokenB, toAddAmountTokenAParsed, toAddAmountTokenBParsed)
                if(parseFloat(price.toSignificant(6)) === 0) {
                    return
                }
                priceBPerA.value = price.toSignificant(6)
                priceAPerB.value = price.invert().toSignificant(6)    
            }

            const getTotalSupply = async () => {
                if(!pair) {
                    return undefined
                }
                return await useTotalSupply(pair.liquidityToken)
            }

            const calculateLiquidityMinted = () => {
                if(!pair) {
                    return undefined
                }
                const tokenAmountA = ParseSdkEntity.fastCreateTokenAmount(selectedTokenA.value, toAddAmountTokenA.value.toString())
                const tokenAmountB = ParseSdkEntity.fastCreateTokenAmount(selectedTokenB.value, toAddAmountTokenB.value.toString())
                liquidityMinted.value =  pair.getLiquidityMinted(totalSupply.value, tokenAmountA, tokenAmountB)
            }

            const calculatePoolTokenPercentage = () => {
                if(noLiquidity.value) {
                    poolTokenPercentage.value = new Percent('100', '100')
                    return
                }
                poolTokenPercentage.value = new Percent(liquidityMinted.value.raw, totalSupply.value.add(liquidityMinted.value).raw)
            }

            const calculateMintInfo = async () => {

                tokenA = wrappedCurrency(selectedTokenA.value, chainId.value)
                tokenB = wrappedCurrency(selectedTokenB.value, chainId.value)

                const pairs = await PairHook.getPair(tokenA, tokenB)
                pairState = pairs[0]
                pair = pairs[1]

                state.pair = pair

                totalSupply.value = await getTotalSupply()

                noLiquidity.value = pairState === PAIR_STATE.NOT_EXISTS || (totalSupply.value && JSBI.equal(totalSupply.value.raw, BIG_INT_ZERO))

                if(!noLiquidity.value) {
                    calculateDependentAmount()
                }
                calculatePrice()
                calculateLiquidityMinted()
                calculatePoolTokenPercentage()
            }

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

            let tokenA
            let tokenB
            let pairState
            let pair

            calculateMintInfo()

            if(smartInterval) {
                if(smartInterval.stopped) {
                    smartInterval.start()
                }
            } else {
                smartInterval = SmartInterval(() => {
                    calculateMintInfo()
                }, FETCH_PRICE_INTERVAL)
            }            
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

        const toSupply = () => {
            confirmAddLiquidityDialogVisible.value = true
        }

        const supply = async () => {

            onSupply.value = true

            const deadline = await useTransactionDeadline()

            const tokenAmountA = ParseSdkEntity.fastCreateTokenAmount(selectedTokenA.value, toAddAmountTokenA.value.toString())
            const tokenAmountB = ParseSdkEntity.fastCreateTokenAmount(selectedTokenB.value, toAddAmountTokenB.value.toString())

            const amountsMin = [
                calculateSlippageAmount(tokenAmountA, noLiquidity.value ? 0 : allowedSlippage.value)[0],
                calculateSlippageAmount(tokenAmountB, noLiquidity.value ? 0 : allowedSlippage.value)[0]
            ]

            let method = ''
            let args = []
            let value = null

            if(isEther(selectedTokenA.value) || isEther(selectedTokenB.value)) {
                
                const tokenBIsBNB = isEther(selectedTokenB.value)
                method = 'addLiquidityETH'
                args = [
                    wrappedCurrency(tokenBIsBNB ? selectedTokenA.value : selectedTokenB.value, chainId.value)?.address ?? '', // token
                    (tokenBIsBNB ? tokenAmountA : tokenAmountB).raw.toString(), // token desired
                    amountsMin[tokenBIsBNB ? 0 : 1].toString(), // token min
                    amountsMin[tokenBIsBNB ? 1 : 0].toString(), // eth min
                    account.value.address,
                    deadline.toHexString(),
                ]
                value = BigNumber.from((tokenBIsBNB ? tokenAmountB : tokenAmountA).raw.toString()).toString()
            } else {

                method = 'addLiquidity'
                args = [
                    wrappedCurrency(selectedTokenA.value, chainId.value)?.address ?? '',
                    wrappedCurrency(selectedTokenB.value, chainId.value)?.address ?? '',
                    tokenAmountA.raw.toString(),
                    tokenAmountB.raw.toString(),
                    amountsMin[0].toString(),
                    amountsMin[1].toString(),
                    account.value.address,
                    deadline.toHexString(),
                ]
                value = null
            }

            const web3 = Web3Connect.getWeb3()

            const routerContract = new web3.eth.Contract(IRouter02, ROUTER_ADDRESS[chainId.value])
            const tx = await routerContract.methods[method](...args)

            const estimatedGas = (await tx.estimateGas({
                ...(value ? { value } : {}),
                from: account.value.address
            })).toString()

            const gasPrice = useGasPrice()

            confirmAddLiquidityDialogVisible.value = false
            waitingConfirmAddLiquidityDialogVisible.value = true
            tx.send({
                ...(value ? { value } : {}),
                from: account.value.address,
                gas: estimatedGas,
                gasPrice: gasPrice,
            })
            .on('transactionHash', (transactionHash) => {
                waitingConfirmAddLiquidityDialogVisible.value = false
                addLiquiditySuccessDialogVisible.value = true
                addLiquidityTransactionHash.value = transactionHash
            })
            .on('receipt', async () => {
                ElNotification({
                    customClass: 'top-of-every-thing',
                    type: 'success',
                    title: 'Transaction receipt',
                    dangerouslyUseHTMLString: true,
                    message: `<a href="${viewAddLiquidityTransactionURL.value}" target="_blank">View on BscScan: ${addLiquidityTransactionHash.value}</a>`,
                    duration: 10 * 1000,
                })
                clearForm()
                await Web3Connect.loadBalance()
                tokenABalance.value = await getTokenBalance(selectedTokenA.value)
                tokenBBalance.value = await getTokenBalance(selectedTokenB.value)
                onSupply.value = false
            })
            .on('error', (error) => {
                console.log('add liquidity error', error)
                waitingConfirmAddLiquidityDialogVisible.value = false
                confirmAddLiquidityDialogVisible.value = true
                ElNotification({
                    customClass: 'top-of-every-thing',
                    type: 'warning',
                    title: 'Supply fail',
                    message: contractErrorExtract(error.message),
                    duration: 15 * 1000,
                })
                onSupply.value = false
            })
        }

        const clearForm = () => {
            toAddAmountTokenA.value = ''
            toAddAmountTokenB.value = ''
            poolTokenPercentage.value = 0
            priceBPerA.value = 0
            priceAPerB.value = 0
            state.pair = null
            if(smartInterval) {
                smartInterval.stop()
            }
        }
        const maxTokenA = () => {
            toAddAmountTokenA.value = tokenABalance.value.toSignificant(6)
            toAddAmountTokenFocus('A')
            toAddAmountValueChange('A')
        }
        const maxTokenB = () => {
            toAddAmountTokenB.value = tokenBBalance.value.toSignificant(6)
            toAddAmountTokenFocus('B')
            toAddAmountValueChange('B')
        }

        const loadSelectedToken = async () => {
            if(route.params.tokenAAddress) {
                const currencyA = await useCurrency(route.params.tokenAAddress)
                selectedTokenA.value = currencyA
            }
            if(route.params.tokenBAddress) {
                const currencyB = await useCurrency(route.params.tokenBAddress)
                selectedTokenB.value = currencyB
            }
        }

        onMounted(async () => {
            isLoading.value = true
            await getPrimaryTokens()
            await loadSelectedToken()
            isLoading.value = false
        })

        onBeforeUnmount(() => {
            if(smartInterval) {
                smartInterval.stop()
            }
        })

        return {
            allowedSlippagePercentFormat ,
            numberFormat,
            poolTokenPercentageFormat,
            account,
            allowedSlippage,
            tokens,
            toAddAmountTokenA,
            toAddAmountTokenB,
            selectedTokenA,
            selectedTokenB,
            priceBPerA,
            priceAPerB,
            tokenABalance,
            tokenBBalance,
            poolTokenPercentage,
            noLiquidity,
            liquidityMinted,
            confirmAddLiquidityDialogVisible,
            waitingConfirmAddLiquidityDialogVisible,
            addLiquiditySuccessDialogVisible,
            tokenAApproval,
            tokenBApproval,
            onSupply,
            state,
            canSupply,
            supplyButtonLabel,
            canMaxTokenA,
            canMaxTokenB,
            viewAddLiquidityTransactionURL,
            dialogTitle,
            toAddAmountTokenFocus,
            toAddAmountValueChange,
            toSupply,
            supply,
            maxTokenA,
            maxTokenB,
            Back,
            selectTokenAHandle,
            selectTokenBHandle,
            isLoading,
        }
    }
}
</script>
<style scoped>
.price-card {
    border: solid 1px gray;
    padding: 4px;
    border-radius: 4px;
}
</style>