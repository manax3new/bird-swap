<template>
<el-dialog
    v-model="data.visible"
    :title="title"
    width="50%"
    @closed="closeHandle" 
>
    <div>
        <div v-if="stakingLimit.gt(0) && !isRemovingStake">
            Max stake for this pool: {{ getFullDisplayBalance(stakingLimit, stakingToken.decimals, 0) }} {{ stakingToken.symbol }}'
            <div class="vertical-space-10"></div>
        </div>
        <div class="flex justify-content-space-between">
            <div>
                {{ isRemovingStake ? 'Unstake' : 'Stake' }}
            </div>
            <div>
                {{ stakingToken.symbol }}
            </div>
        </div>
        <div class="vertical-space-10"></div>
        <el-card>
            <div class="text-align-right">
                <div>
                    <el-input
                    v-model="data.stakeAmount" 
                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                    @input="stakeAmountChangeHandle"
                    placeholder="0.00"></el-input>
                </div>
                <div>
                    {{ stakingTokenPrice !== 0 && `~${formattedUsdValueStaked || 0} USD`}}
                </div>
            </div>
        </el-card>
        <div v-if="data.hasReachedStakeLimit" class="text-align-right text-red">
            {{ `Maximum total stake: ${getFullDisplayBalance(new BigNumber(stakingLimit), stakingToken.decimals, 0)} ${stakingToken.symbol}` }}
            <div class="vertical-space-10"></div>
        </div>
        <div v-if="userNotEnoughToken" class="text-align-right text-red">
            {{ `Insufficient ${stakingToken.symbol} balance` }}
            <div class="vertical-space-10"></div>
        </div>
        <div class="text-align-right">
            Balance: {{ getFullDisplayBalance(getCalculatedStakingLimit, stakingToken.decimals, stakingToken.decimals) }}
        </div>
        <div class="vertical-space-10"></div>
        <div>
            <div class="text-align-right">{{data.percent}}%</div>
            <el-slider @change="percentChangeHandle" v-model="data.percent" />
        </div>
        <div class="flex-center">
            <el-button v-for="(percent, key) of PERCENTS" :key="key"
            type="primary"
            @click="percentChangeHandle(percent.value)"
            plain>{{ percent.label }}</el-button>
        </div>
        <br/>
        <div class="flex justify-content-space-around">
            <el-button @click="confirm" :disabled="!canConfirm" class="custom-button-100percent" type="primary">
                {{confirmButtonLabel}}
            </el-button>
        </div>
        <br/>
        <div class="flex justify-content-center">
            <el-link type="primary" :href="getStakeTokenUrl" target="_blank">
                Get {{stakingToken.symbol}} &nbsp;<el-icon><Link /></el-icon>
            </el-link>
        </div>
    </div>
</el-dialog>
</template>
<script>

import { reactive, watch, computed, watchEffect } from 'vue'
import BigNumber from 'bignumber.js'
import { getDecimalAmount, getFullDisplayBalance, formatNumber } from '@/utils/formatBalance'
import useStakePool from '@/views/pool/hooks/useStakePool'
import useUnstakePool from '@/views/pool/hooks/useUnstakePool'
import { ElNotification } from 'element-plus'
import { callWithGasPriceErrorExtract } from '@/lib/contractErrorExtract'
import store from '@/store'
import { viewTransactionOnBscUrl } from '@/lib/utils.js'
import { toastError } from '@/use/Toast'
import { getCurrencyAddress } from '@/utils'
import { useRouter } from 'vue-router'
import { unwrappedToken } from '@/utils/wrappedCurrency'

export default {
    props: {
        'visible': {},
        'isBnbPool': {},
        'pool': {},
        'stakingTokenBalance': {},
        'stakingTokenPrice': {},
        'isRemovingStake': {
            default: false,
        },
    },
    setup(props, context) {

        const router = useRouter()

        const PERCENTS = [
            {
                value: 25,
                label: '25%'
            },
            {
                value: 50,
                label: '50%'
            },
            {
                value: 75,
                label: '75%'
            },
            {
                value: 100,
                label: 'Max'
            },
        ]

        const data = reactive({
            visible: false,
            stakeAmount: '',
            percent: 0,
            pendingTx: false,
            hasReachedStakeLimit: false,
        })

        const title = computed(() => {
            return props.isRemovingStake ? 'Unstake' : 'Stake in Pool'
        })

        const earningToken = computed(() => {
            return props.pool.earningToken
        })
        const stakingToken = computed(() => {
            return props.pool.stakingToken
        })
        const stakingLimit = computed(() => {
            return props.pool.stakingLimit
        })
        const userData = computed(() => {
            return props.pool.userData
        })
        const sousId = computed(() => {
            return props.pool.sousId
        })

        const canConfirm = computed(() => {
            if(data.hasReachedStakeLimit) {
                return false
            }
            if(userNotEnoughToken.value) {
                return false
            }
            if(data.pendingTx) {
                return false
            }
            if(!data.stakeAmount || parseFloat(data.stakeAmount) <= 0) {
                return false
            }
            const stakeAmount = new BigNumber(data.stakeAmount)
            const balanceAmount = new BigNumber(data.value)
            if(stakeAmount.gt(balanceAmount)) {
                return false
            }
            return true
        })

        const confirmButtonLabel = computed(() => {
            if(data.pendingTx) {
                return 'Confirming'
            } else {
                return 'Confirm'
            }
        })

        const getCalculatedStakingLimit = computed(() => {
            if(props.isRemovingStake) {
                return userData.value.stakedBalance
            }
            return stakingLimit.value.gt(0) && props.stakingTokenBalance.gt(stakingLimit.value) ? stakingLimit.value : props.stakingTokenBalance
        })

        const fullDecimalStakeAmount = computed(() => {
            return getDecimalAmount(new BigNumber(data.stakeAmount), stakingToken.value.decimals)
        })

        const usdValueStaked = computed(() => {
            return new BigNumber(data.stakeAmount).times(props.stakingTokenPrice)
        })

        const formattedUsdValueStaked = computed(() => {
            return !usdValueStaked.value.isNaN() && formatNumber(usdValueStaked.value.toNumber())
        })

        const userNotEnoughToken = computed(() => {
            return props.isRemovingStake
            ? userData.value.stakedBalance.lt(fullDecimalStakeAmount.value)
            : userData.value.stakingTokenBalance.lt(fullDecimalStakeAmount.value)
        })

        const getStakeTokenUrl = computed(() => {
            if(!stakingToken.value) {
                return ''
            }
            const outputCurrency = getCurrencyAddress(unwrappedToken(stakingToken.value))
            const routerData = router.resolve({
                name: 'Swap', 
                query: {
                    outputCurrency: outputCurrency
                }
            })
            return routerData.href
        })

        watch(() => props.visible, (newVal) => {
            data.visible = newVal
        })

        watchEffect(() => {
            if (stakingLimit.value.gt(0) && !props.isRemovingStake) {
                data.hasReachedStakeLimit = fullDecimalStakeAmount.value.plus(userData.value.stakedBalance).gt(stakingLimit.value)
            }
        })

        const stakeAmountChangeHandle = (stakeAmount) => {
            if (stakeAmount) {
                const convertedInput = getDecimalAmount(new BigNumber(stakeAmount), stakingToken.value.decimals)
                const percentage = Math.floor(convertedInput.dividedBy(getCalculatedStakingLimit.value).multipliedBy(100).toNumber())
                data.percent = Math.min(percentage, 100)
            } else {
                data.percent = 0
            }
            data.stakeAmount = stakeAmount
        }

        const percentChangeHandle = (percent) => {
            if (percent > 0) {
                const percentageOfStakingMax = getCalculatedStakingLimit.value.dividedBy(100).multipliedBy(percent)
                const amountToStake = getFullDisplayBalance(percentageOfStakingMax, stakingToken.value.decimals, stakingToken.value.decimals)
                data.stakeAmount = amountToStake
            } else {
                data.stakeAmount = ''
            }
            data.percent = percent
        }

        const closeHandle = () => {
            context.emit('closed')
        }

        const confirm = () => {
            if(props.isRemovingStake) {
                unstake()
            } else {
                stake()
            }
        }

        const stake = async () => {
            data.pendingTx = true
            const { onStake } = useStakePool(sousId.value, props.isBnbPool)
            try {
                const tx = await onStake(data.stakeAmount, stakingToken.value.decimals)
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
                    const message = `Your ${stakingToken.value.symbol} funds have been staked in the pool!`
                    ElNotification({
                        customClass: 'top-of-every-thing',
                        type: 'success',
                        title: 'Staked',
                        dangerouslyUseHTMLString: true,
                        message: `${message}
                                    <br/>
                                    <a href="${viewTransactionOnBscUrl(receipt.transactionHash)}" target="_blank">View on BscScan: ${receipt.transactionHash}</a>`,
                        duration: 10 * 1000,
                    })
                    store.dispatch('requestForFetchPool')
                    close()
                }
            } catch (error) {
                console.log('stake error', error.message)
                toastError('Error', callWithGasPriceErrorExtract(error.message))
            }
            data.pendingTx = false
        }

        const unstake = async () => {            
            data.pendingTx = true
            const { onUnstake } = useUnstakePool(sousId.value, props.pool.enableEmergencyWithdraw)
            try {
                const tx = await onUnstake(data.stakeAmount, stakingToken.value.decimals)
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
                    const message = `Your ${earningToken.value.symbol} earnings have also been harvested to your wallet!`
                    ElNotification({
                        customClass: 'top-of-every-thing',
                        type: 'success',
                        title: 'Unstaked',
                        dangerouslyUseHTMLString: true,
                        message: `${message}
                                    <br/>
                                    <a href="${viewTransactionOnBscUrl(receipt.transactionHash)}" target="_blank">View on BscScan: ${receipt.transactionHash}</a>`,
                        duration: 10 * 1000,
                    })
                    store.dispatch('requestForFetchPool')
                    close()
                }
            } catch (error) {
                console.log('unstake error', error.message)
                toastError('Error', callWithGasPriceErrorExtract(error.message))
            }
            data.pendingTx = false
        }

        const close = () => {
            data.visible = false
        }

        return {
            data,
            closeHandle,
            title,
            stakingToken,
            PERCENTS,
            canConfirm,
            confirmButtonLabel,
            confirm,
            stakingLimit,
            getFullDisplayBalance,
            formattedUsdValueStaked,
            BigNumber,
            getCalculatedStakingLimit,
            userNotEnoughToken,
            stakeAmountChangeHandle,
            percentChangeHandle,
            getStakeTokenUrl,
        }
    },
}
</script>