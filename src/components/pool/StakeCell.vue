<template>
<div class="StakeCell">
    <div class="text-small">
        <div v-if="!account.address">
            START STAKING
        </div>
        <div v-else-if="isApproved">
            <div v-if="isStaked">
                {{ stakingToken.symbol }} STAKED
            </div>
            <div v-else>
                STAKE {{ stakingToken.symbol }}
            </div>
        </div>
        <div v-else>
            Enable Pool
        </div>
    </div>
    <div v-if="!account.address">
        <ConnetWalletButton></ConnetWalletButton>
    </div>
    <div v-else-if="isApproved">
        <div v-if="isStaked" class="flex justify-content-space-between align-items-center">
            <div>
                <div class="text-bold">
                    {{ numeralNumberFormat(stakedTokenBalance, 5) }}
                </div>
                <div v-if="stakedTokenDollarBalance" class="text-small">
                    ~{{ stakedTokenDollarBalance ? numeralNumberFormat(stakedTokenDollarBalance) : '0.00' }} USD
                </div>
            </div>
            <div class="flex align-items-center">
                <div>
                    <el-button @click="toUnstake" type="primary" :icon="Minus" />
                </div>
                <div class="horizontal-space-2"></div>
                <div>
                    <el-button @click="toStake" type="primary" :icon="Plus" />
                </div>
            </div>
        </div>
        <div v-else>
            <el-button @click="toStake" type="primary" class="custom-button-100percent">Stake</el-button>
        </div>
    </div>
    <div v-else>
        <el-button @click="handleApprove" :disabled="(isOnApprove || needFetchPool)" type="primary" class="custom-button-100percent">Enable</el-button>
    </div>

    <StakeModal
    :visible="stakeModalVisible"
    :isBnbPool="isBnbPool"
    :pool="pool"
    :stakingTokenBalance="stakingTokenBalance"
    :stakingTokenPrice="stakingTokenPrice"
    @closed="() => {stakeModalVisible = false}"></StakeModal>

    <StakeModal
    :visible="unstakeModalVisible"
    :isBnbPool="isBnbPool"
    :pool="pool"
    :stakingTokenBalance="stakingTokenBalance"
    :stakingTokenPrice="stakingTokenPrice"
    :isRemovingStake="true"
    @closed="() => {unstakeModalVisible = false}"></StakeModal>
</div>
</template>
<script>

import { Plus, Minus } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import useWeb3Connect from '@/use/Web3Connect'
import ConnetWalletButton from '@/components/ConnectWallet'
import { useERC20 } from '@/use/Contract'
import { PoolCategory } from '@/constant/config/types'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from '@/utils/bigNumber'
import { useApprovePool } from '@/views/pool/hooks/useApprove'
import { callWithGasPriceErrorExtract } from '@/lib/contractErrorExtract'
import { viewTransactionOnBscUrl } from '@/lib/utils.js'
import { ElNotification } from 'element-plus'
import store from '@/store'
import { toastError } from '@/use/Toast'
import StakeModal from '@/components/pool/StakeModal'
import { numeralNumberFormat } from '@/lib/utils'

export default {
    props: [
        'stakingToken',
        'stakedBalance',
        'stakedTokenBalance',
        'stakedTokenDollarBalance',
        'sousId',
        'earningToken',
        'stakingLimit',
        'isFinished',
        'poolCategory',
        'userData',
        'stakingTokenPrice',
        'pool',
    ],
    components: {
        ConnetWalletButton,
        StakeModal,
    },
    setup(props) {

        const Web3Connect = useWeb3Connect()
        const account = Web3Connect.account

        const isOnApprove = ref(false)
        const stakeModalVisible = ref(false)
        const unstakeModalVisible = ref(false)

        const stakingTokenContract = useERC20(props.stakingToken.address || '')
        const { handleApprove: handlePoolApprove } = useApprovePool(
            stakingTokenContract,
            props.sousId,
        )

        const isBnbPool = computed(() => {
            return props.poolCategory === PoolCategory.BINANCE
        })
        const allowance = computed(() => {
            return props.userData?.allowance ? new BigNumber(props.userData.allowance) : BIG_ZERO
        })
        const stakingTokenBalance = computed(() => {
            return props.userData?.stakingTokenBalance ? new BigNumber(props.userData.stakingTokenBalance) : BIG_ZERO
        })
        const needsApproval = computed(() => {
            return !allowance.value.gt(0) && !isBnbPool.value
        })
        const needFetchPool = computed(() => {
            return store.state.needFetchPool
        })

        const label = computed(() => {
            if(!account.value.address) {
                return 'Start staking'
            }
            return 'Enable Pool'
        })

        const toStake = async () => {
            stakeModalVisible.value = true
        }

        const toUnstake = async () => {
            unstakeModalVisible.value = true
        }
        
        const handleApprove = async () => {
            isOnApprove.value = true
            try {
                const tx = await handlePoolApprove()
                const receipt = await tx.wait()
                if (receipt?.status) {
                    ElNotification({
                        customClass: 'top-of-every-thing',
                        type: 'success',
                        title: 'Contract Enabled',
                        dangerouslyUseHTMLString: true,
                        message: `You can now stake in the ${props.earningToken.symbol} pool!
                                    <br/>
                                    <a href="${viewTransactionOnBscUrl(receipt.transactionHash)}" target="_blank">View on BscScan: ${receipt.transactionHash}</a>`,
                        duration: 10 * 1000,
                    })
                    store.dispatch('requestForFetchPool')
                }
            } catch (error) {
                toastError('Error', callWithGasPriceErrorExtract(error.message))
            }
            isOnApprove.value = false
        }

        const isApproved = computed(() => {
            return allowance.value.isGreaterThan(0)  
        })
        const isStaked = computed(() => {
            return props.stakedBalance.gt(0)
        })

        return {
            label,
            Plus,
            Minus,
            toUnstake,
            toStake,
            account,
            isApproved,
            isStaked,
            isOnApprove,
            needFetchPool,
            handleApprove,
            stakingTokenBalance,
            needsApproval,
            isBnbPool,
            stakeModalVisible,
            unstakeModalVisible,
            numeralNumberFormat,
        }  
    },
}
</script>