<template>
    <div class="Bridge">
        
        <h1>
            {{ tokenSymbol }} Bridge
        </h1>

        <div>
            <el-card>
                <div class="flex justify-content-space-around">
                    <div>
                        <div v-if="chainA.chain" class="text-bold">
                            <el-link type="primary" target="_blank" :href="chainAContractUrl">
                                {{ chainA.chain.name }} Bridge Contract 
                                &nbsp;<el-icon><Link /></el-icon>
                            </el-link>
                        </div>
                        <div>
                            {{ tokenBalanceFormat(chainA.contractBalance, chainA.token.decimals, 5) }} {{ tokenSymbol }}
                        </div>
                    </div>
                    <div>
                        <div v-if="chainB.chain" class="text-bold">
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
                        <el-input v-model="form.chainAToBTokenAmount" style="width: 140px;"></el-input>
                        <el-button type="primary">Bridge to {{ chainB.chain.name }} </el-button>
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
                        <el-input v-model="form.chainBToBTokenAmount" style="width: 140px;"></el-input>
                        <el-button type="primary">Bridge to {{ chainA.chain.name }} </el-button>
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
        }
    }
}
</script>
