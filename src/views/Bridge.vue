<template>
    <div class="Bridge">
        
        <h1>
            {{ tokenSymbol }} Bridge
        </h1>

        <div>
            <el-card>
                <div class="flex justify-content-space-around">
                    <div v-if="chainA.chain">
                        <div class="text-bold">
                            <el-link type="primary" target="_blank" :href="chainAContractUrl">
                                {{ chainA.chain.name }} Bridge Contract 
                                &nbsp;<el-icon><Link /></el-icon>
                            </el-link>
                        </div>
                        <div>
                            {{ tokenBalanceFormat(chainA.contractBalance, chainA.token.decimals, 5) }} {{ tokenSymbol }}
                        </div>
                    </div>
                    <div v-if="chainB.chain">
                        <div class="text-bold">
                            <el-link type="primary" target="_blank" :href="chainBContractUrl">
                                {{ chainB.chain.name }} Bridge Contract
                                &nbsp;<el-icon><Link /></el-icon>
                            </el-link>
                        </div>
                        <div>
                            {{ tokenBalanceFormat(chainB.contractBalance, chainB.token.decimals, 5) }} {{ tokenSymbol }}
                        </div>
                    </div>
                    <div>
                        <div class="text-bold">
                            Bridging Fee
                        </div>
                        <div>
                            {{ FEE }} {{ tokenSymbol }}/TX
                        </div>
                    </div>
                </div>
                
            </el-card>
        </div>
        <br>
        <div class="flex justify-content-space-around">
            <el-card>
                <div v-if="chainA.chain">
                    <div>
                        {{ chainA.chain.name }}
                    </div>
                    <div class="flex">
                        <el-input 
                        style="width: 200px;" 
                        v-model="form.chainAToBTokenAmount" 
                        placeholder="0.0" 
                        oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></el-input>
                        <el-button type="primary"
                        :disabled="!aToBInputValid">
                            Bridge to {{ chainB.chain.name }} 
                        </el-button>
                    </div>
                    <div v-if="aToBInputError" class="text-red">
                        {{ aToBInputError }}
                    </div>
                    <div>
                        Balance: 
                        {{ tokenBalanceFormat(chainA.tokenBalance, chainA.token.decimals, 5) }} 
                        {{ tokenSymbol }}
                    </div>
                </div>
            </el-card>
            <el-card>
                <div v-if="chainB.chain">
                    <div>
                        {{ chainB.chain.name }}
                    </div>
                    <div class="flex">
                        <el-input 
                        style="width: 200px;" 
                        v-model="form.chainBToATokenAmount" 
                        placeholder="0.0" 
                        oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></el-input>
                        <el-button type="primary"
                        :disabled="!bToAInputValid">
                            Bridge to {{ chainA.chain.name }} 
                        </el-button>
                    </div>
                    <div v-if="bToAInputError" class="text-red">
                        {{ bToAInputError }}
                    </div>
                    <div>
                        Balance: 
                        {{ tokenBalanceFormat(chainB.tokenBalance, chainB.token.decimals, 5) }} 
                        {{ tokenSymbol }}
                    </div>
                </div>
            </el-card>
        </div>

    </div>
</template>
<script>

import { getTokenBalance } from '@/state/bridge'
import useWeb3Connect from '@/use/Web3Connect'
import { onMounted, reactive, computed } from 'vue'
import CHAIN from '@/constant/Chain'
import { TOKENS, BRIDGE_CONTRACT_ADDRESS } from '@/constant/Bridge.js'
import { tokenBalanceFormat } from '@/utils/formatBalance'
import { isTestnet } from '@/constant/config/Env'
import { Link } from '@element-plus/icons-vue'
import { TokenAmount } from '@pancakeswap/sdk'
import { parseUnits } from '@ethersproject/units'

const SELECT_TOKEN = 'usdt'
const FEE = '0.01'

export default {
    components: {
        Link,
    },
    setup() {

        const Web3Connect = useWeb3Connect()
        const account = Web3Connect.account

        const chainA = reactive({
            chain: null,
            token: null,
            tokenBalance: 0,
            contractBalance: 0,
        })

        const chainB = reactive({
            chain: null,
            token: null,
            tokenBalance: 0,
            contractBalance: 0,
        })

        const form = reactive({
            chainAToBTokenAmount: '',
            chainBToATokenAmount: '',
        })

        const tokenSymbol = computed(() => {
            return isTestnet ? 'BIRD' : 'USDT'
        })
        const chainAContractUrl = computed(() => {
            return `${chainA.chain.blockExplorerUrl}/address/${BRIDGE_CONTRACT_ADDRESS[chainA.chain.chainId]}`
        })
        const chainBContractUrl = computed(() => {
            return `${chainB.chain.blockExplorerUrl}/address/${BRIDGE_CONTRACT_ADDRESS[chainB.chain.chainId]}`
        })

        const aToBInputError = computed(() => {
            return inputError(chainA, form.chainAToBTokenAmount)
        })
        const aToBInputValid = computed(() => {
            return inputValid(form.chainAToBTokenAmount, aToBInputError.value)
        })
        const bToAInputError = computed(() => {
            return inputError(chainB, form.chainBToATokenAmount)
        })
        const bToAInputValid = computed(() => {
            return inputValid(form.chainBToATokenAmount, bToAInputError.value)
        })
        
        const inputError = (chain, inputAmount) => {
            if(!inputAmount) {
                return ''
            }
            const amountToBride = new TokenAmount(chain.token, parseUnits(inputAmount, chain.token.decimals))
            const amountBalance = new TokenAmount(chain.token, chain.tokenBalance)
            if(amountBalance.lessThan(amountToBride)) {
                return `Insufficient ${tokenSymbol.value} balance`
            }
            return ''
        }

        const inputValid = (inputAmount, inputError) => {
            if(!inputAmount) {
                return false
            }
            if(parseFloat(inputAmount) <= 0) {
                return false
            }
            if(inputError) {
                return false
            }
            return true
        }

        const fetchTokenInfo = async (chainId, token, account) => {
            const balances = await getTokenBalance(chainId, token.address, account)
            const balance = balances[0]
            return {
                balance,
            }
        }

        const fetchAll = async () => {
    
            if(isTestnet) {
                chainA.token = TOKENS[CHAIN.bnbTestnet.chainId][SELECT_TOKEN]
                chainA.chain = CHAIN.bnbTestnet
                chainB.token = TOKENS[CHAIN.sepoliaTestnet.chainId][SELECT_TOKEN]
                chainB.chain = CHAIN.sepoliaTestnet
            }

            if(!chainA.chain || !chainB.chain) {
                return
            }

            const [tokenAInfo, tokenBInfo, contractAInfo, contractBInfo] = await Promise.all([
                fetchTokenInfo(chainA.chain.chainId, chainA.token, account.value.address),
                fetchTokenInfo(chainB.chain.chainId, chainB.token, account.value.address),
                fetchTokenInfo(chainA.chain.chainId, chainA.token, BRIDGE_CONTRACT_ADDRESS[chainA.chain.chainId]),
                fetchTokenInfo(chainB.chain.chainId, chainB.token, BRIDGE_CONTRACT_ADDRESS[chainB.chain.chainId]),
            ])

            chainA.tokenBalance = tokenAInfo.balance
            chainA.contractBalance = contractAInfo.balance
            chainB.tokenBalance = tokenBInfo.balance
            chainB.contractBalance = contractBInfo.balance

        }

        onMounted(() => {
            fetchAll()
        })

        return {
            chainA,
            chainB,
            tokenBalanceFormat,
            isTestnet,
            form,
            tokenSymbol,
            FEE,
            chainAContractUrl,
            chainBContractUrl,
            aToBInputError,
            aToBInputValid,
            bToAInputError,
            bToAInputValid,
        }
    }
}
</script>
