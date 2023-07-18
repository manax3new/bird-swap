<template>
    <div class="Bridge">
        <div class="flex-center">
            <div>
                <h1>Bridge</h1>
                <div>
                    <el-button type="primary" plain @click="refresh">Refresh</el-button>
                </div>
            </div>
        </div>
        <br>
        <div class="flex-center">
            <el-card>
                <div class="flex justify-content-space-around">
                    <div>
                        <div class="text-bold">
                            <el-link type="primary" target="_blank" :href="chainAContractUrl">
                                {{ chainA.chain ? chainA.chain.name : '-' }} Bridge Contract
                                &nbsp;<el-icon><Link /></el-icon>
                            </el-link>
                        </div>
                        <div>
                            Balance {{ chainA.token ? `${chainA.token.symbol}: ${tokenBalanceFormat(chainA.contractBalance, chainA.token.decimals, 5)}` : 0 }}
                        </div>
                    </div>
                    <div class="horizontal-space-10"></div>
                    <div>
                        <div class="text-bold">
                            <el-link type="primary" target="_blank" :href="chainBContractUrl">
                                {{ chainB.chain ? chainB.chain.name : '-' }} Bridge Contract
                                &nbsp;<el-icon><Link /></el-icon>
                            </el-link>
                        </div>
                        <div>
                            Balance {{ chainB.token ? `${chainB.token.symbol}: ${tokenBalanceFormat(chainB.contractBalance, chainB.token.decimals, 5)}` : 0 }}
                        </div>
                    </div>
                    <div class="horizontal-space-10"></div>
                    <div>
                        <div class="text-bold">
                            Bridging Fee
                        </div>
                        <div>
                            {{ FEE }} token/TX
                        </div>
                    </div>
                </div>
            </el-card>
        </div>
        <br>
        <div class="flex-center">
            <el-card>
                <div class="flex-center">
                    <div class="text-align-center">
                        <div>
                            <el-select v-model="chainA.chain" value-key="chainId" class="m-2" placeholder="Select network">
                                <el-option
                                v-for="item in data.chains"
                                :key="item.chainId"
                                :label="item.name"
                                :value="item"
                                :disabled="item === chainB.chain"
                                />
                            </el-select>
                        </div>
                        <div class="vertical-space-5"></div>
                        <div class="flex justify-content-center">
                            <div>
                                <el-select v-model="chainA.token" value-key="symbol" class="m-2" placeholder="Select Token">
                                    <el-option
                                    v-for="item in availableTokens"
                                    :key="item.symbol"
                                    :label="item.symbol"
                                    :value="item"
                                    />
                                </el-select>
                            </div>
                            <div>
                                <el-input 
                                style="width: 200px;" 
                                v-model="form.chainAToBTokenAmount" 
                                placeholder="0.0" 
                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></el-input>
                                <div class="vertical-space-5"></div>
                                <div class="flex justify-content-end">
                                    Balance: 
                                    <div v-if="chainA.token">
                                        {{ tokenBalanceFormat(chainA.tokenBalance, chainA.token.decimals, 5) }} 
                                    </div>
                                    <div v-else>
                                        0.00
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="vertical-space-10"></div>
                        <el-icon>
                            <Bottom />
                        </el-icon>
                        <div class="vertical-space-10"></div>
                        <div class="flex align-items-center justify-content-space-between">
                            <el-select v-model="chainB.chain" value-key="chainId" class="m-2" placeholder="Select network">
                                <el-option
                                v-for="item in data.chains"
                                :key="item.chainId"
                                :label="item.name"
                                :value="item"
                                :disabled="item === chainA.chain"
                                />
                            </el-select>
                            <div class="horizontal-space-5"></div>
                            <div class="flex justify-content-end">
                                <div v-if="chainB.token">
                                    {{ chainB.token.symbol }}
                                </div>
                                <div class="horizontal-space-5"></div>
                                <div>
                                    Balance: 
                                </div>
                                <div v-if="chainB.token">
                                    {{ tokenBalanceFormat(chainB.tokenBalance, chainB.token.decimals, 5) }} 
                                </div>
                                <div v-else>
                                    0.00
                                </div>
                            </div>
                        </div>
                        <div class="vertical-space-10"></div>
                        <div class="vertical-space-10"></div>
                        <div>
                            <div v-if="aToBInputError" class="text-red">
                                {{ aToBInputError }}
                            </div>
                            <div v-if="chainA.token">
                                <ApproveButton 
                                    customClass="custom-button-100percent"
                                    @approvalChange="approval => { chainA.tokenApproval = approval }"
                                    :token="chainA.token" 
                                    :spender="chainABridgeContractAddress"
                                    :owner="account.address" 
                                    :amount="form.chainAToBTokenAmount">
                                </ApproveButton>
                            </div>
                            <div class="vertical-space-10"></div>
                            <el-button 
                            type="primary" 
                            class="custom-button-100percent"
                            :disabled="!aToBInputValid || !chainA.tokenApproval"
                            @click="briding">
                                Bridge
                            </el-button>
                        </div>
                    </div>
                </div>
            </el-card>
        </div>
        <br>
    </div>
</template>
<script>

import { getTokenBalance } from '@/state/bridge'
import { getBridgeAddress } from '@/state/bridge/Contract'
import BRIDGE_ABI from '@/constant/abi/Bridge.json'
import useWeb3Connect from '@/use/Web3Connect'
import { reactive, computed, ref, watch } from 'vue'
import { TOKENS, BRIDGE_CONTRACT_ADDRESS } from '@/constant/Bridge.js'
import { tokenBalanceFormat } from '@/utils/formatBalance'
import { Link, Bottom } from '@element-plus/icons-vue'
import { TokenAmount } from '@pancakeswap/sdk'
import { parseUnits } from '@ethersproject/units'
import { useGasPrice } from '@/state/user/hook'
import contractErrorExtract from '@/lib/contractErrorExtract.js'
import { ElNotification, ElLoading } from 'element-plus'
import CHAIN from '@/constant/Chain'
import ApproveButton from '@/components/ApproveButton'

const FEE = '0.01'

export default {
    components: {
        Link,
        Bottom,
        ApproveButton,
    },
    setup() {

        const Web3Connect = useWeb3Connect()
        const account = Web3Connect.account
        const network = Web3Connect.network

        const data = reactive({
            chains: [],
        })

        const chainA = reactive({
            chain: null,
            token: null,
            tokenBalance: 0,
            contractBalance: 0,
            tokenApproval: false,
        })

        const chainB = reactive({
            chain: null,
            token: null,
            tokenBalance: 0,
            contractBalance: 0,
            tokenApproval: false,
        })

        const form = reactive({
            chainAToBTokenAmount: '',
            chainBToATokenAmount: '',
        })

        const isOnBriding = ref(false)

        for(const chainKey in CHAIN) {
            data.chains.push(CHAIN[chainKey])
        }

        const availableTokens = computed(() => {
            if(!chainA.chain) {
                return []
            }
            const tokenInChain = TOKENS[chainA.chain.chainId]
            const tokensInChain = []
            for(const tokenKey in tokenInChain) {
                tokensInChain.push(tokenInChain[tokenKey])
            }
            return tokensInChain
        })

        const chainAContractUrl = computed(() => {
            return chainA.chain ? `${chainA.chain.blockExplorerUrl}/address/${BRIDGE_CONTRACT_ADDRESS[chainA.chain.chainId]}` : ''
        })
        const chainBContractUrl = computed(() => {
            return chainB.chain ? `${chainB.chain.blockExplorerUrl}/address/${BRIDGE_CONTRACT_ADDRESS[chainB.chain.chainId]}` : ''
        })
        const chainABridgeContractAddress = computed(() => {
            return chainA.chain ? getBridgeAddress(chainA.chain.chainId) : ''
        })

        const aToBInputError = computed(() => {
            return inputError(chainA, chainB, form.chainAToBTokenAmount)
        })
        const aToBInputValid = computed(() => {
            return inputValid(form.chainAToBTokenAmount, aToBInputError.value)
        })
        const bToAInputError = computed(() => {
            return inputError(chainB, chainA, form.chainBToATokenAmount)
        })
        const bToAInputValid = computed(() => {
            return inputValid(form.chainBToATokenAmount, bToAInputError.value)
        })

        watch(() => chainA.chain, (newVal) => {
            chainA.token = null
            if((newVal)) {
                fetchChainInfo(newVal, chainA.token, chainA)
                autoSelectChainBToken()
            }
            
        })
        watch(() => chainB.chain, (newVal) => {
            if((newVal)) {
                fetchChainInfo(newVal, chainB.token, chainB)
                autoSelectChainBToken()
            }  
        })
        watch(() => chainA.token, (newVal) => {
            if((newVal)) {
                fetchChainInfo(chainA.chain, newVal, chainA)
                autoSelectChainBToken()
            }
        })
        watch(() => chainB.token, (newVal) => {
            if((newVal)) {
                fetchChainInfo(chainB.chain, newVal, chainB)
            }
        })

        const autoSelectChainBToken = () => {
            if(!chainA.chain || !chainA.token || !chainB.chain) {
                chainB.token = null
                return
            }
            chainB.token = TOKENS[chainB.chain.chainId][chainA.token.symbol]
        }

        const fetchChainInfo = async (chain, token, chainObject) => {
            if(!chain || !token) {
                chainObject.tokenBalance = 0
                chainObject.contractBalance = 0
                return
            }
            const tokenInfo = await fetchTokenInfo(chain.chainId, token, account.value.address)
            const contractInfo = await fetchTokenInfo(chain.chainId, token, BRIDGE_CONTRACT_ADDRESS[chain.chainId])
            chainObject.tokenBalance = tokenInfo.balance
            chainObject.contractBalance = contractInfo.balance
        }
        
        const inputError = (chain, pairChain, inputAmount) => {
            if(!inputAmount) {
                return ''
            }
            if(!network.value) {
                return ''
            }
            if(!pairChain.chain) {
                return ''
            }
            if(network.value.id !== chain.chain.chainId) {
                return `Change network to ${chain.chain.name}`
            }
            if(chain.chain.chainId === pairChain.chain.chainId) {
                return `Can not bridge on same network`
            }

            const amountToBride = new TokenAmount(chain.token, parseUnits(inputAmount, chain.token.decimals))
            const amountBalance = new TokenAmount(chain.token, chain.tokenBalance)
            const destinationContractTokenAmount = new TokenAmount(chain.token, pairChain.contractBalance)
            if(amountBalance.lessThan(amountToBride)) {
                return `Insufficient ${chainA.token.symbol} balance`
            }
            if(destinationContractTokenAmount.lessThan(amountToBride)) {
                return `Insufficient ${chainA.token.symbol} balance on ${pairChain.chain.name} smart contract`
            }
            return ''
        }

        const inputValid = (inputAmount, inputError) => {
            if(!network.value) {
                return ''
            }
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

        const briding = async () => {

            let transactionHash = ''
            let fullScreenLoading = null

            isOnBriding.value = true
            fullScreenLoading = ElLoading.service({
                lock: true,
                text: 'Loading',
                background: 'rgba(0, 0, 0, 0.7)',
            })

            const web3 = Web3Connect.getWeb3()

            const _amount = parseUnits(form.chainAToBTokenAmount, chainA.token.decimals)
            const _token = chainA.token.address
            const toChain = chainB.chain.chainId

            const bridgeContractAddress = getBridgeAddress(chainA.chain.chainId)
            const bridgeContract = new web3.eth.Contract(BRIDGE_ABI, bridgeContractAddress)

            const tx = bridgeContract.methods.receiveTokens(_amount, _token, toChain)
            const estimatedGas = await tx.estimateGas({from: account.value.address})
            const gasPrice = useGasPrice()

            tx.send({
                from: account.value.address,
                gas: estimatedGas,
                gasPrice: gasPrice,
            })
            .on('transactionHash', (_transactionHash) => {
                transactionHash = _transactionHash
            })
            .on('receipt', async () => {
                ElNotification({
                    customClass: 'top-of-every-thing',
                    type: 'success',
                    title: 'Transaction receipt',
                    dangerouslyUseHTMLString: true,
                    message: `<a href="${viewTransactionOnBlockExplorer(chainA.chain, transactionHash)}" target="_blank">View on Block Explorer: ${transactionHash}</a>`,
                    duration: 10 * 1000,
                })
                
                setTimeout(async () => {
                    await fetchAll()
                    clearForm()
                    isOnBriding.value = false
                    fullScreenLoading.close()
                    ElNotification({
                        customClass: 'top-of-every-thing',
                        type: 'success',
                        title: 'Briding done.',
                        dangerouslyUseHTMLString: true,
                        message: `<a href="${viewTransactionOnBlockExplorer(chainA.chain, transactionHash)}" target="_blank">View on Block Explorer: ${transactionHash}</a>`,
                        duration: 10 * 1000,
                    })
                }, 10 * 1000)
            })
            .on('error', (error) => {
                console.log('bridge error', error.message)
                ElNotification({
                    customClass: 'top-of-every-thing',
                    type: 'warning',
                    title: 'Bridge fail',
                    message: contractErrorExtract(error.message),
                    duration: 15 * 1000,
                })
                isOnBriding.value = false
                fullScreenLoading.close()
            }) 
        }

        const viewTransactionOnBlockExplorer = (chain, transactionHash) => {
            return `${chain.blockExplorerUrl}/tx/${transactionHash}`
        }

        const clearForm = () => {
            form.chainAToBTokenAmount = ''
            form.chainBToATokenAmount = ''
        }

        const refresh = async () => {

            let fullScreenLoading = null

            isOnBriding.value = true
            fullScreenLoading = ElLoading.service({
                lock: true,
                text: 'Loading',
                background: 'rgba(0, 0, 0, 0.7)',
            })

            await fetchAll()

            fullScreenLoading.close()
        }

        return {
            data,
            availableTokens,
            chainA,
            chainB,
            tokenBalanceFormat,
            form,
            FEE,
            chainAContractUrl,
            chainBContractUrl,
            chainABridgeContractAddress,
            aToBInputError,
            aToBInputValid,
            bToAInputError,
            bToAInputValid,
            briding,
            refresh,
            account,
        }
    }
}
</script>
