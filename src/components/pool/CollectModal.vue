<template>
    <el-dialog
        v-model="data.visible"
        :title="title"
        @closed="closeHandle"
        width="50%"
    >
        <div>
            <div v-if="isCompoundPool" class="flex-center align-items-center">
                <el-button-group>
                    <el-button type="primary" @click="data.shouldCompound = true" :plain="!data.shouldCompound">Compound</el-button>
                    <el-button type="primary" @click="data.shouldCompound = false" :plain="data.shouldCompound">Harvest</el-button>
                </el-button-group>
                <div class="horizontal-space-2"></div>
                <el-tooltip
                    effect="dark"
                >
                    <template #content> 
                        <div>
                            Compound: collect and restake CAKE into pool.
                        </div>
                        <br/>
                        <div>
                            Harvest: collect CAKE and send to wallet.
                        </div>
                    </template>
                    <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
            </div>
            <br/>
            <div class="flex justify-content-space-between">
                <div>
                    {{ data.shouldCompound ? 'Compounding' : 'Harvesting'}}:
                </div>
                <div>
                    <div class="text-medium text-primary">
                        {{ formattedBalance }}&nbsp;{{ earningToken.symbol }}
                    </div>
                    <div v-if="earningsDollarValue" class="text-small">
                        ~{{ formatNumber(earningsDollarValue) }} USD
                    </div>
                </div>
            </div>
            <br/>
            <br/>
            <div>
                <el-button @click="confirm" :disabled="data.pendingTx" class="custom-button-100percent" type="primary">
                    {{ data.pendingTx ? 'Confirming' : 'Confirm' }}
                </el-button>
                <div class="vertical-space-10"></div>
                <el-button @click="close" class="custom-button-100percent" type="primary" plain>
                    Close Window
                </el-button>
            </div>
        </div>
    </el-dialog>
</template>
<script>

import { reactive, computed, watch } from 'vue'
import { numeralNumberFormat } from '@/lib/utils'
import { formatNumber } from '@/utils/formatBalance'
import useHarvestPool from '@/views/pool/hooks/useHarvestPool'
import useStakePool from '@/views/pool/hooks/useStakePool'
import { ElNotification } from 'element-plus'
import { callWithGasPriceErrorExtract } from '@/lib/contractErrorExtract'
import store from '@/store'
import { viewTransactionOnBscUrl } from '@/lib/utils.js'
import { toastError } from '@/use/Toast'
import { QuestionFilled } from '@element-plus/icons-vue'

export default {
    props: {
        'visible': {},
        'formattedBalance': {},
        'fullBalance': {},
        'earningToken': {},
        'earningsDollarValue': {},
        'sousId': {},
        'isBnbPool': {},
        'isCompoundPool': {
            default: false,
        }
    },
    components: {
        QuestionFilled,
    },
    setup(props, context) {
        
        const data = reactive({
            visible: false,
            pendingTx: false,
            shouldCompound: props.isCompoundPool,
        })

        const title = computed(() => {
            return `${props.earningToken.symbol} ${props.isCompoundPool ? 'Collect' : 'Harvest'}`
        })

        watch(() => props.visible, (newVal) => {
            data.visible = newVal
        })

        const closeHandle = () => {
            context.emit('closed')
        }

        const confirm = async () => {

            data.pendingTx = true

            const { onReward } = useHarvestPool(props.sousId, props.isBnbPool)
            const { onStake } = useStakePool(props.sousId, props.isBnbPool)

            try {

                let tx = null
                if(data.shouldCompound) {
                    tx = await onStake(props.fullBalance, props.earningToken.decimals)
                } else {
                    tx = await onReward()
                }

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

                    const title = data.shouldCompound ? 'Compounded' : 'Harvested'
                    let message = ''
                    if(data.shouldCompound) {
                        message = `Your ${props.earningToken.symbol} earnings have been re-invested into the pool!`
                    } else {
                        message = `Your ${props.earningToken.symbol} earnings have been sent to your wallet!`
                    }

                    ElNotification({
                        customClass: 'top-of-every-thing',
                        type: 'success',
                        title: title,
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
                toastError('Error', callWithGasPriceErrorExtract(error.message))
            }
            data.pendingTx = false
        }

        const close = () => {
            data.visible = false
        }

        return {
            data,
            title,
            closeHandle,
            numeralNumberFormat,
            formatNumber,
            confirm,
            close,
        }
    },
}
</script>
