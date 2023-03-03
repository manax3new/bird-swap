<template>
    <div class="AddLiquidity">
        <div>
            <router-link :to="{name: 'Liquidity'}">back</router-link>
        </div>
        <div>
            Add Liquidity
        </div>
        <div v-if="noLiquidity">
            
            <div>You are the first liquidity provider.</div>
            <div>The ratio of tokens you add will set the price of this pool.</div>
            <div>Once you are happy with the rate click supply to review.</div>
        </div>
        <div>
            <el-button v-show="canMaxTokenA" @click="maxTokenA" link type="primary">Max</el-button>
            <input 
            placeholder="0.0"
            oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            @focus="toAddAmountTokenFocus('A')" 
            @input="toAddAmountValueChange('A')" 
            v-model="toAddAmountTokenA"/>
            <select v-model="selectedTokenA">
                <option v-for="(token, key) of tokens" :key="key" :value="token">{{token.symbol}}</option>
            </select>
            Balance: {{tokenABalance ? tokenABalance.toSignificant(6) : 0}}
        </div>
        <br/>
        <div>+</div>
        <br/>
        <div>
            <el-button v-show="canMaxTokenB" @click="maxTokenB" link type="primary">Max</el-button>
            <input 
            placeholder="0.0"
            oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            @focus="toAddAmountTokenFocus('B')" 
            @input="toAddAmountValueChange('B')" 
            v-model="toAddAmountTokenB"/>
            <select v-model="selectedTokenB">
                <option v-for="(token, key) of tokens" :key="key" :value="token">{{token.symbol}}</option>
            </select>
            Balance: {{tokenBBalance ? tokenBBalance.toSignificant(6) : 0}}
        </div>
        <br/>
        <div v-if="selectedTokenA && selectedTokenB">
            <div>
                Prices and pool share
            </div>
            <div>
                <div>{{priceBPerA || '-'}}</div>
                <div>{{selectedTokenB.symbol}} per {{selectedTokenA.symbol}}</div>
                <div>{{priceAPerB || '-'}}</div>
                <div>{{selectedTokenA.symbol}} per {{selectedTokenB.symbol}}</div>
                <div>{{poolTokenPercentageFormat(poolTokenPercentage)}}%</div>
                <div>Share of Pool</div>
            </div>
        </div>
        <div v-if="selectedTokenA && selectedTokenB">
            <div>
                <ApproveButton 
                @approvalChange="approval => { tokenAApproval = approval }"
                :token="selectedTokenA" 
                :owner="account.address" 
                :amount="toAddAmountTokenA">
                </ApproveButton>
            </div>
            <div>
                <ApproveButton 
                @approvalChange="approval => { tokenBApproval = approval }"
                :token="selectedTokenB" 
                :owner="account.address" 
                :amount="toAddAmountTokenB">
                </ApproveButton>
            </div>
            <div>
                <el-button :disabled="!canSupply || onSupply" @click="toSupply" type="primary">{{supplyButtonLabel}}</el-button>
            </div>
        </div>

        <el-dialog
            v-model="confirmAddLiquidityDialogVisible"
            :title="dialogTitle"
            width="50%"
        >
            <div>
                <h1>{{liquidityMinted.toSignificant(6)}}</h1>
                <h3>{{selectedTokenA.symbol}}/{{selectedTokenB.symbol}} Pool Tokens</h3>
                <div>
                    Output is estimated. If the price changes by more than {{allowedSlippagePercentFormat(allowedSlippage)}}% your transaction will revert.
                </div>
                <div>
                    <div style="display: flex;">
                        <div>
                            {{selectedTokenA.symbol}} Deposited
                        </div>
                        <div>
                            {{toAddAmountTokenA}}
                        </div>
                    </div>
                    <div style="display: flex;">
                        <div>
                            {{selectedTokenB.symbol}} Deposited
                        </div>
                        <div>
                            {{toAddAmountTokenB}}
                        </div>
                    </div>
                    <div style="display: flex;">
                        <div>
                            Rates
                        </div>
                        <div>
                            1 {{selectedTokenA.symbol}} = {{priceBPerA}} {{selectedTokenB.symbol}}
                        </div>
                    </div>
                    <div style="display: flex;">
                        <div>
                            1 {{selectedTokenB.symbol}} = {{priceAPerB}} {{selectedTokenA.symbol}}
                        </div>
                    </div>
                    <div style="display: flex;">
                        <div>
                            Share of Pool:
                        </div>
                        <div>
                            {{poolTokenPercentageFormat(poolTokenPercentage)}}%
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" :disabled="onSupply" @click="supply">{{onSupply ? 'Supplying' : 'Confirm Supply'}}</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog
            v-model="waitingConfirmAddLiquidityDialogVisible"
            :title="dialogTitle"
            width="50%"
        >
            <div>
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
            <div>
                <h1>Transaction Submitted</h1>
                <h3><a :href="viewAddLiquidityTransactionURL" target="_blank">View on BscScan</a></h3>
                <AddTokenButton v-if="pair?.liquidityToken" :token="pair.liquidityToken"></AddTokenButton>
                <el-button @click="addLiquiditySuccessDialogVisible = false" type="primary">Close</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>

import axiosWrapper from '@/lib/axiosWrapper'
import store from '@/store'
import { Price, TokenAmount, Percent, Pair, JSBI } from '@pancakeswap/sdk'
import useERC20 from '@/use/ERC20.js'
import useParseSdkEntity from '@/use/ParseSdkEntity.js'
import ApproveButton from '@/components/ApproveButton'
import usePair from '@/use/Pair.js'
import contractErrorExtract from '@/lib/contractErrorExtract.js'
import { BigNumber } from '@ethersproject/bignumber'
import useGasPrice from '@/use/GasPrice.js'
import { calculateSlippageAmount, allowedSlippagePercentFormat } from '@/lib/utils.js'
import PAIR_STATE from '@/constant/PairState'
import IRouter02 from '@/constant/abi/IRouter02.json'
import { ROUTER_ADDRESS } from '@/constant/config/Contract.js'
import { CHAIN_ID, BLOCK_EXPLORER_BASE_URL } from '@/constant/config/Env.js'
import { BIG_INT_ZERO } from '@/constant/Exchange'
import validator from 'validator'
import { parseUnits } from '@ethersproject/units'
import { ElNotification } from 'element-plus'
import AddTokenButton from '@/components/AddTokenButton'

export default {
    name: 'AddLiquidity',
    components: {
        ApproveButton,
        AddTokenButton,
    },
    data() {
        return {
            isInited: false,
            ERC20: null,
            ParseSdkEntity: null,
            Pair: null,
            ethereum: null,
            tokens: [],
            toAddAmountTokenA: '',
            toAddAmountTokenB: '',
            selectedTokenA: null,
            selectedTokenB: null,
            priceBPerA: 0,
            priceAPerB: 0,
            toAddAmountInputFocusOn: '', //A, B
            toAddAmountValueChangeOn: '', //A, B
            tokenABalance: null,
            tokenBBalance: null,
            poolTokenPercentage: 0,
            noLiquidity: false,
            totalSupply: null,
            liquidityMinted: null,
            confirmAddLiquidityDialogVisible: false,
            waitingConfirmAddLiquidityDialogVisible: false,
            addLiquiditySuccessDialogVisible: false,
            allowedSlippage: 50, // 0.5%
            tokenAApproval: false,
            tokenBApproval: false,
            onSupply: false,
            addLiquidityTransactionHash: '',
        }
    },
    computed: {
        web3() {
            return this.$web3
        },
        account() {
            return store.state.account
        },
        independentToken() {
            let independentToken = 'A'
            if(this.toAddAmountInputFocusOn === 'A' && this.toAddAmountValueChangeOn === 'A') {
                independentToken = 'A'
            } else if(this.toAddAmountInputFocusOn === 'B' && this.toAddAmountValueChangeOn === 'B') {
                independentToken = 'B'
            }
            return independentToken
        },
        independentCurrency() {
            if(this.independentToken === 'A') {
                return this.selectedTokenA
            } else if(this.independentToken === 'B') {
                return this.selectedTokenB
            } else {
                return 0
            }
        },
        independentAmount() {
            if(this.independentToken === 'A') {
                return this.toAddAmountTokenA
            } else if(this.independentToken === 'B') {
                return this.toAddAmountTokenB
            } else {
                return 0
            }
        },
        canSupply() {

            const balanceA = (this.tokenABalance) ? parseFloat(this.tokenABalance.toSignificant(6)) : 0
            const balanceB = (this.tokenBBalance) ? parseFloat(this.tokenBBalance.toSignificant(6)) : 0

            if(parseFloat(this.toAddAmountTokenA) === 0 || parseFloat(this.toAddAmountTokenB) === 0) {
                return false
            }
            if(parseFloat(this.toAddAmountTokenA) <= balanceA && 
            parseFloat(this.toAddAmountTokenB) <= balanceB && 
            this.tokenAApproval && 
            this.tokenBApproval
            ) {
                return true
            } else {
                return false
            }
        },
        supplyButtonLabel() {
            if(this.onSupply) {
                return 'Supplying'
            }
            if(this.canSupply) {
                return 'Supply'
            }
            const balanceA = (this.tokenABalance) ? parseFloat(this.tokenABalance.toSignificant(6)) : 0
            const balanceB = (this.tokenBBalance) ? parseFloat(this.tokenBBalance.toSignificant(6)) : 0

            if(parseFloat(this.toAddAmountTokenA) > balanceA) {
                return `Insufficient ${this.selectedTokenA.symbol} balance`
            }
            if(parseFloat(this.toAddAmountTokenB) > balanceB) {
                return `Insufficient ${this.selectedTokenB.symbol} balance`
            }
            return 'Supply'
        },
        canMaxTokenA() {
            if(!this.tokenABalance) {
                return false
            }
            if(!this.toAddAmountTokenA) {
                return true
            }
            return parseFloat(this.toAddAmountTokenA) < parseFloat(this.tokenABalance.toSignificant(6))
        },
        canMaxTokenB() {
            if(!this.tokenBBalance) {
                return false
            }
            if(!this.toAddAmountTokenB) {
                return true
            }
            return parseFloat(this.toAddAmountTokenB) < parseFloat(this.tokenBBalance.toSignificant(6))
        },
        viewAddLiquidityTransactionURL() {
            return `${BLOCK_EXPLORER_BASE_URL}/tx/${this.addLiquidityTransactionHash}`
        },
        dialogTitle() {
            return this.noLiquidity ? 'You are creating a pool' : 'You will receive'
        },
    },
    watch: {
        async selectedTokenA(newVal) {
            this.calculateAmountToAdd()
            this.tokenABalance = await this.getERC20Balance(newVal)
        },
        async selectedTokenB(newVal) {
            this.calculateAmountToAdd()
            this.tokenBBalance = await this.getERC20Balance(newVal)
        },
    },
    methods: {
        async loadTokenList() {
            const res = await axiosWrapper({
                method: 'get',
                url: `/tokens/pancake.json`,
            })
            this.tokens = res.data
            this.selectedTokenA = this.tokens.find((token) => {
                return token.symbol === 'ALPACA'
                // return token.symbol === 'TK1'
            })
            this.selectedTokenB = this.tokens.find((token) => {
                return token.symbol === 'CAKE'
                // return token.symbol === 'TK2'
            })
        },
        toAddAmountTokenFocus(tokenKey) {
            this.toAddAmountInputFocusOn = tokenKey
        },
        toAddAmountValueChange(tokenKey) {
            this.toAddAmountValueChangeOn = tokenKey
            this.calculateAmountToAdd()
        },
        async calculateAmountToAdd() {

            const calculateDependentAmount = () => {

                const independentTokenAmount = this.ParseSdkEntity.fastCreateTokenAmount(this.independentCurrency, this.independentAmount)

                const dependentToken = this.independentToken === 'A' ? tokenA : tokenB

                const dependentAmount = pair.priceOf(dependentToken).quote(independentTokenAmount)

                if(this.independentToken === 'A') {
                    this.toAddAmountTokenB = dependentAmount.toSignificant(6)
                } else if(this.independentToken === 'B') {
                    this.toAddAmountTokenA = dependentAmount.toSignificant(6)
                }
            }

            const calculatePrice = () => {
                const toAddAmountTokenAParsed = parseUnits(this.toAddAmountTokenA.toString(), tokenA.decimals)
                const toAddAmountTokenBParsed = parseUnits(this.toAddAmountTokenB.toString(), tokenB.decimals)
                const price = new Price(tokenA, tokenB, toAddAmountTokenAParsed, toAddAmountTokenBParsed)
                if(parseFloat(price.toSignificant(6)) === 0) {
                    return
                }
                this.priceBPerA = price.toSignificant(6)
                this.priceAPerB = price.invert().toSignificant(6)    
            }

            const getTotalSupply = async () => {
                const pairAddress = Pair.getAddress(tokenA, tokenB)
                const rawTotalSupply = await this.ERC20.totalSupply(pairAddress)
                if(!pair) {
                    return undefined
                }
                return new TokenAmount(pair.liquidityToken, rawTotalSupply.toString())
            }

            const getLiquidityMinted = () => {
                const tokenAmountA = this.ParseSdkEntity.fastCreateTokenAmount(this.selectedTokenA, this.toAddAmountTokenA)
                const tokenAmountB = this.ParseSdkEntity.fastCreateTokenAmount(this.selectedTokenB, this.toAddAmountTokenB)
                if(!pair) {
                    return undefined
                }
                return pair.getLiquidityMinted(this.totalSupply, tokenAmountA, tokenAmountB)
            }

            const calculatePoolTokenPercentage = () => {
                if(this.noLiquidity) {
                    this.poolTokenPercentage = 100
                    return
                }
                const percent = new Percent(this.liquidityMinted.raw, this.totalSupply.add(this.liquidityMinted).raw)
                this.poolTokenPercentage = percent.toSignificant(6)
            }

            if(!this.independentAmount) {
                this.clearForm()
                return
            }
            if(parseFloat(this.independentAmount) === 0) {
                return
            }
            if(!validator.isNumeric(this.independentAmount)) {
                return
            }

            const tokenA = this.ParseSdkEntity.createToken(this.selectedTokenA)
            const tokenB = this.ParseSdkEntity.createToken(this.selectedTokenB)

            const pairs = await this.Pair.getPair(this.selectedTokenA, this.selectedTokenB)
            const [pairState, pair] = pairs

            this.pair = pair

            this.totalSupply = await getTotalSupply()

            this.noLiquidity = pairState === PAIR_STATE.NOT_EXISTS || (this.totalSupply && JSBI.equal(this.totalSupply.raw, BIG_INT_ZERO))

            if(!this.noLiquidity) {
                calculateDependentAmount()
            }
            
            calculatePrice()
            this.liquidityMinted = getLiquidityMinted()
            calculatePoolTokenPercentage()
        },
        async getERC20Balance(token) {
            if(!this.account.address) {
                return 0
            }
            const balance = await this.ERC20.balanceOf(token.address, this.account.address)
            const tokenAmount = this.ParseSdkEntity.createTokenAmount(token, balance)
            return tokenAmount
        },
        numberFormat(raw, digit = 2) {
            return parseFloat(raw).toFixed(digit)
        },
        poolTokenPercentageFormat(raw) {
            if(parseFloat(raw) === 0) {
                return '0'
            }
            if(parseFloat(raw) < 0.01) {
                return '<0.01'
            } else {
                return this.numberFormat(raw)
            }
        },
        toSupply() {
            this.confirmAddLiquidityDialogVisible = true
        },
        async supply () {

            const getCurrentBlockTimestamp = async () => {
                let blockTimestamp
                if(process.env.NODE_ENV === 'development') {
                    blockTimestamp = new Date().valueOf().toString()
                } else {
                    const blockNumber = await this.web3.eth.getBlockNumber()
                    const block = await this.web3.eth.getBlock(blockNumber)
                    blockTimestamp = block.timestamp.toString()
                }
                return BigNumber.from(blockTimestamp)
            }

            const getDeadline = (blockTimestamp) => {
                const ttl = 20 * 60 // 20 minutes
                return blockTimestamp.add(BigNumber.from(ttl.toString()))
            }

            this.onSupply = true

            const blockTimestamp = await getCurrentBlockTimestamp()
            const deadline = getDeadline(blockTimestamp)

            const tokenAmountA = this.ParseSdkEntity.fastCreateTokenAmount(this.selectedTokenA, this.toAddAmountTokenA)
            const tokenAmountB = this.ParseSdkEntity.fastCreateTokenAmount(this.selectedTokenB, this.toAddAmountTokenB)

            const amountsMin = [
                calculateSlippageAmount(tokenAmountA, this.noLiquidity ? 0 : this.allowedSlippage)[0],
                calculateSlippageAmount(tokenAmountB, this.noLiquidity ? 0 : this.allowedSlippage)[0]
            ]

            const args = [
                this.selectedTokenA.address,
                this.selectedTokenB.address,
                tokenAmountA.raw.toString(),
                tokenAmountB.raw.toString(),
                amountsMin[0].toString(),
                amountsMin[1].toString(),
                this.account.address,
                deadline.toHexString(),
            ]

            const routerContract = new this.web3.eth.Contract(IRouter02, ROUTER_ADDRESS[CHAIN_ID])
            const tx = await routerContract.methods.addLiquidity(...args)

            const estimatedGas = await tx.estimateGas({from: this.account.address})

            const gasPrice = useGasPrice()

            this.confirmAddLiquidityDialogVisible = false
            this.waitingConfirmAddLiquidityDialogVisible = true
            tx.send({
                from: this.account.address,
                gas: estimatedGas,
                gasPrice: gasPrice,
            })
            .on('transactionHash', (transactionHash) => {
                this.waitingConfirmAddLiquidityDialogVisible = false
                this.addLiquiditySuccessDialogVisible = true
                this.addLiquidityTransactionHash = transactionHash
            })
            .on('receipt', async () => {
                ElNotification({
                    customClass: 'top-of-every-thing',
                    type: 'success',
                    title: 'Transaction receipt',
                    dangerouslyUseHTMLString: true,
                    message: `<a href="${this.viewAddLiquidityTransactionURL}" target="_blank">View on BscScan: ${this.addLiquidityTransactionHash}</a>`,
                    duration: 10 * 1000,
                })
                this.clearForm()
                this.tokenABalance = await this.getERC20Balance(this.selectedTokenA)
                this.tokenBBalance = await this.getERC20Balance(this.selectedTokenB)
                this.onSupply = false
            })
            .on('error', (error) => {
                this.waitingConfirmAddLiquidityDialogVisible = false
                this.confirmAddLiquidityDialogVisible = true
                ElNotification({
                    customClass: 'top-of-every-thing',
                    type: 'warning',
                    title: 'Supply fail',
                    message: contractErrorExtract(error.message),
                    duration: 15 * 1000,
                })
                this.onSupply = false
            })            
        },
        allowedSlippagePercentFormat(raw) {
            return allowedSlippagePercentFormat(raw)
        },
        clearForm() {
            this.toAddAmountTokenA = ''
            this.toAddAmountTokenB = ''
            this.poolTokenPercentage = 0
            this.priceBPerA = 0
            this.priceAPerB = 0
        },
        maxTokenA() {
            this.toAddAmountTokenA = this.tokenABalance.toSignificant(6)
            this.toAddAmountTokenFocus('A')
            this.toAddAmountValueChange('A')
        },
        maxTokenB() {
            this.toAddAmountTokenB = this.tokenBBalance.toSignificant(6)
            this.toAddAmountTokenFocus('B')
            this.toAddAmountValueChange('B')
        },
    },
    async mounted() {
        this.ERC20 = useERC20(this.web3)
        this.ParseSdkEntity = useParseSdkEntity()
        this.Pair = usePair(this.web3)
        await this.loadTokenList()
    }
}
</script>
<style scoped>
.AddLiquidity {
    text-align: center;
}
</style>