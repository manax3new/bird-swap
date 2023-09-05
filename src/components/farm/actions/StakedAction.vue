<template>
<div class="FarmActionsStakedAction">
    <div class="text-small">
        <div v-if="!account.address">
            Start Farming
        </div>
        <div v-else-if="isApproved">
            <div v-if="isStaked">
                {{lpSymbol}} STAKED
            </div>
            <div v-else>
                STAKE {{lpSymbol}}
            </div>
        </div>
        <div v-else>
            Enable Farm
        </div>
    </div>
    <div v-if="!account.address">
        <ConnetWalletButton></ConnetWalletButton>
    </div>
    <div v-else-if="isApproved">
        <div v-if="isStaked" class="flex justify-content-space-between align-items-center">
            <StakedLP
            :stakedBalance="stakedBalance"
            :lpSymbol="lpSymbol"
            :quoteTokenSymbol="quoteToken.symbol"
            :tokenSymbol="token.symbol"
            :lpTotalSupply="lpTotalSupply"
            :tokenAmountTotal="tokenAmountTotal"
            :quoteTokenAmountTotal="quoteTokenAmountTotal"
            ></StakedLP>
            <div class="flex align-items-center">
                <div>
                    <el-button @click="toWithdraw" type="primary" :icon="Minus" />
                </div>
                <div class="horizontal-space-2"></div>
                <div>
                    <el-button @click="toStake" type="primary" :icon="Plus" />
                </div>
            </div>
        </div>
        <div v-else>
            <el-button @click="toStake" type="primary" class="custom-button-100percent">Stake LP</el-button>
        </div>
    </div>
    <div v-else>
        <el-button @click="handleApprove" :disabled="(isOnApprove || needFetchFarm)" type="primary" class="custom-button-100percent">Enable</el-button>
    </div>

    <el-dialog
        v-model="depositModal.visible"
        title="Stake LP Tokens"
        width="50%"
    >
        <div>
            <el-card>
                <div class="flex justify-content-space-between" style="padding: 5px 15px;">
                    <div>
                        <strong>Stake</strong>
                    </div>
                    <div>
                        <strong>Balance: {{modalBalanceDisplay(depositModalFullBalance)}}</strong>
                    </div>
                </div>
                <div class="vertical-space-10"></div>
                <div class="flex justify-content-space-between">
                    <div>
                        <el-input v-model="depositModal.stakeAmount"></el-input>
                    </div>
                    <div>
                        <el-button @click="depositModalSelectMax">Max</el-button>&nbsp;{{lpSymbol}}
                    </div>
                </div>
            </el-card>
            <br/>
            <div class="flex justify-content-space-around">
                <el-button @click="() => depositModal.visible = false" class="custom-button-100percent" type="primary" plain>Cancel</el-button>
                <el-button @click="stake" :disabled="!depositModalCanConfirm" class="custom-button-100percent" type="primary">
                    {{depositModalConfirmButtonLabel}}
                </el-button>
            </div>
            <br/>
            <div class="flex justify-content-center">
                <el-link type="primary" :href="getLpTokenUrl" target="_blank">
                    Get {{lpSymbol}} &nbsp;<el-icon><Link /></el-icon>
                </el-link>
            </div>
        </div>
    </el-dialog>

    <el-dialog
        v-model="withdrawModal.visible"
        title="Unstake LP Tokens"
        width="50%"
    >
        <div>
            <el-card>
                <div class="flex justify-content-space-between" style="padding: 5px 15px;">
                    <div>
                       <strong>Unstake</strong>
                    </div>
                    <div>
                        <strong>  Balance: {{modalBalanceDisplay(withdrawModalFullBalance)}}</strong>
                    </div>
                </div>
                <div class="vertical-space-10"></div>
                <div class="flex justify-content-space-between">
                    <div>
                        <el-input v-model="withdrawModal.withdrawAmount"></el-input>
                    </div>
                    <div>
                        <el-button @click="withdrawModalSelectMax">Max</el-button>&nbsp;{{lpSymbol}}
                    </div>
                </div>
            </el-card>
            <br/>
            <div class="flex justify-content-space-around">
                <el-button @click="() => withdrawModal.visible = false" class="custom-button-100percent" type="primary" plain>Cancel</el-button>
                <el-button @click="withdraw" :disabled="!withdrawModalCanConfirm" class="custom-button-100percent" type="primary">
                    {{withdrawModalConfirmButtonLabel}}
                </el-button>
            </div>
        </div>
    </el-dialog>
</div>
</template>

<script>

import { computed, ref, reactive } from 'vue'
import StakedLP from './StakedLP'
import { Plus, Minus, Link } from '@element-plus/icons-vue'
import useApproveFarm from '@/views/farm/hooks/useApproveFarm'
import { getAddress } from '@/utils/addressHelpers'
import { useERC20 } from '@/use/Contract'
import { toastError } from '@/use/Toast'
import { callWithGasPriceErrorExtract } from '@/lib/contractErrorExtract'
import { viewTransactionOnBscUrl } from '@/lib/utils.js'
import { ElNotification } from 'element-plus'
import store from '@/store'
import { parseUnits } from '@ethersproject/units'
import { formatBigNumber, getFullDisplayBalance } from '@/utils/formatBalance'
import useStakeFarm from '@/views/farm/hooks/useStakeFarm'
import useUnstakeFarm from '@/views/farm/hooks/useUnstakeFarm'
import useWeb3Connect from '@/use/Web3Connect'
import ConnetWalletButton from '@/components/ConnectWallet'
import BigNumber from 'bignumber.js'

export default {
    props: [
        'farm',
        'lpLabel',
        'displayApr',
        'getLpTokenUrl',
    ],
    components: {
        StakedLP,
        Link,
        ConnetWalletButton,
    },
    setup(props) {

        const Web3Connect = useWeb3Connect()

        const account = Web3Connect.account

        const isOnApprove = ref(false)
        const isOnStake = ref(false)
        const isOnWithdraw = ref(false)

        const depositModal = reactive({
            visible: false,
            stakeAmount: '0',
        })

        const withdrawModal = reactive({
            visible: false,
            withdrawAmount: '0',
        })

        const pid = computed(() => {
            return props.farm.pid
        })
        const allowance = computed(() => {
            return props.farm.userData.allowance
        })
        const tokenBalance = computed(() => {
            return props.farm.userData.tokenBalance
        })
        const stakedBalance = computed(() => {
            return props.farm.userData.stakedBalance
        })
        const isApproved = computed(() => {
            return allowance.value.isGreaterThan(0)  
        })
        const isStaked = computed(() => {
            return stakedBalance.value.gt(0)
        })
        const lpSymbol = computed(() => {
            return props.farm.lpSymbol
        })
        const quoteToken = computed(() => {
            return props.farm.quoteToken
        })
        const token = computed(() => {
            return props.farm.token
        })
        const lpTotalSupply = computed(() => {
            return props.farm.lpTotalSupply
        })
        const tokenAmountTotal = computed(() => {
            return props.farm.tokenAmountTotal
        })
        const quoteTokenAmountTotal = computed(() => {
            return props.farm.quoteTokenAmountTotal
        })
        const lpAddresses = computed(() => {
            return props.farm.lpAddresses
        })
        const needFetchFarm = computed(() => {
            return store.state.needFetchFarm
        })

        const depositModalMax = computed(() => {
            return tokenBalance.value
        })
        const depositModalFullBalance = computed(() => {
            return getFullDisplayBalance(depositModalMax.value)
        })
        const depositModalConfirmButtonLabel = computed(() => {
            if(isOnStake.value) {
                return 'Confirming...'
            } else {
                return 'Confirm'
            }
        })
        const depositModalCanConfirm = computed(() => {
            if(isOnStake.value) {
                return false
            }
            if(!depositModal.stakeAmount || parseFloat(depositModal.stakeAmount) <= 0) {
                return false
            }
            const stakeAmount = new BigNumber(depositModal.stakeAmount)
            const balanceAmount = new BigNumber(depositModalFullBalance.value)
            if(stakeAmount.gt(balanceAmount)) {
                return false
            }
            return true
        })

        const withdrawModalMax = computed(() => {
            return stakedBalance.value
        })
        const withdrawModalFullBalance = computed(() => {
            return getFullDisplayBalance(withdrawModalMax.value)
        })
        const withdrawModalConfirmButtonLabel = computed(() => {
            if(isOnWithdraw.value) {
                return 'Confirming...'
            } else {
                return 'Confirm'
            }
        })
        const withdrawModalCanConfirm = computed(() => {
            if(isOnWithdraw.value) {
                return false
            }
            if(!withdrawModal.withdrawAmount || parseFloat(withdrawModal.withdrawAmount) <= 0) {
                return false
            }
            const withdrawAmount = new BigNumber(withdrawModal.withdrawAmount)
            const stakedAmount = new BigNumber(withdrawModalFullBalance.value)
            if(withdrawAmount.gt(stakedAmount)) {
                return false
            }
            return true
        })

        const handleApprove = async () => {
            const lpAddress = getAddress(lpAddresses.value)
            const lpContract = await useERC20(lpAddress)
            const { onApprove } = useApproveFarm(lpContract)
            isOnApprove.value = true
            try {
                const tx = await onApprove()
                const receipt = await tx.wait()
                if (receipt?.status) {
                    ElNotification({
                        customClass: 'top-of-every-thing',
                        type: 'success',
                        title: 'Contract Enabled',
                        dangerouslyUseHTMLString: true,
                        message: `<a href="${viewTransactionOnBscUrl(receipt.transactionHash)}" target="_blank">View on BscScan: ${receipt.transactionHash}</a>`,
                        duration: 10 * 1000,
                    })
                    store.dispatch('requestForFetchFarm')
                }
            } catch (error) {
                toastError('Error', callWithGasPriceErrorExtract(error.message))
            }
            isOnApprove.value = false
        }

        const toStake = () => {
            depositModalClearForm()
            depositModal.visible = true
        }

        const toWithdraw = () => {
            withdrawModalClearForm()
            withdrawModal.visible = true
        }

        const modalBalanceDisplay = (balance) => {
            const decimals = 18
            if(balance === '0' || !balance) {
                return 0
            }
            const balanceUnits = parseUnits(balance, decimals)
            return formatBigNumber(balanceUnits, decimals, decimals)
        }

        const depositModalSelectMax = () => {
            depositModal.stakeAmount = depositModalFullBalance.value
        }

        const depositModalClearForm = () => {
            depositModal.stakeAmount = '0'
        }

        const stake = async () => {
            isOnStake.value = true
            const { onStake } = useStakeFarm(pid.value)
            try {
                const tx = await onStake(depositModal.stakeAmount)
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
                const receipt = await tx.wait()
                if (receipt?.status) {
                    ElNotification({
                        customClass: 'top-of-every-thing',
                        type: 'success',
                        title: 'Staked',
                        dangerouslyUseHTMLString: true,
                        message: `Your funds have been staked in the farm 
                                    <br/>
                                    <a href="${viewTransactionOnBscUrl(receipt.transactionHash)}" target="_blank">View on BscScan: ${receipt.transactionHash}</a>`,
                        duration: 10 * 1000,
                    })
                    store.dispatch('requestForFetchFarm')
                }
            } catch (error) {
                toastError('Error', callWithGasPriceErrorExtract(error.message))
            }
            isOnStake.value = false
            depositModal.visible = false
        }

        const withdrawModalSelectMax = () => {
            withdrawModal.withdrawAmount = withdrawModalFullBalance.value
        }
        const withdrawModalClearForm = () => {
            withdrawModal.withdrawAmount = '0'
        }
        const withdraw = async () => {
            isOnWithdraw.value = true
            const { onUnstake } = useUnstakeFarm(pid.value)
            try {
                const tx = await onUnstake(withdrawModal.withdrawAmount)
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
                const receipt = await tx.wait()
                if (receipt?.status) {
                    ElNotification({
                        customClass: 'top-of-every-thing',
                        type: 'success',
                        title: 'Unstaked',
                        dangerouslyUseHTMLString: true,
                        message: `Your earnings have also been harvested to your wallet
                                    <br/>
                                    <a href="${viewTransactionOnBscUrl(receipt.transactionHash)}" target="_blank">View on BscScan: ${receipt.transactionHash}</a>`,
                        duration: 10 * 1000,
                    })
                    store.dispatch('requestForFetchFarm')
                }
            } catch (error) {
                toastError('Error', callWithGasPriceErrorExtract(error.message))
            }
            isOnWithdraw.value = false
            withdrawModal.visible = false
        }

        return {
            account,
            isApproved,
            tokenBalance,
            stakedBalance,
            isStaked,
            lpSymbol,
            quoteToken,
            token,
            lpTotalSupply,
            tokenAmountTotal,
            quoteTokenAmountTotal,
            Plus,
            Minus,
            handleApprove,
            isOnApprove,
            needFetchFarm,
            depositModal,
            toStake,
            depositModalFullBalance,
            modalBalanceDisplay,
            depositModalSelectMax,
            stake,
            isOnStake,
            depositModalCanConfirm,
            depositModalConfirmButtonLabel,
            withdrawModal,
            toWithdraw,
            withdrawModalFullBalance,
            withdrawModalSelectMax,
            withdraw,
            isOnWithdraw,
            withdrawModalCanConfirm,
            withdrawModalConfirmButtonLabel,
        }
    }
}

</script>