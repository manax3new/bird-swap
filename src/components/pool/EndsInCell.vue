<template>
<div class="EndsInCell">
    <div v-if="uiVersion === 2">
        <div v-if="state.shouldShowBlockCountdown" class="flex align-items-center">
            <div class="text-small text-bold text-white">
                <div v-if="state.hasPoolStarted || !state.shouldShowBlockCountdown">
                    Ends in
                </div>
                <div v-else>
                    Starts in
                </div>
            </div>
            <div class="horizontal-space-5"></div>
            <div class="text-primary">
                <div v-if="state.shouldShowBlockCountdown">
                    <el-link :href="viewCountdownOnBscUrl(state.hasPoolStarted ? endBlock : startBlock)" target="_blank" type="primary">
                        {{ numeralNumberFormat(state.blocksToDisplay, 0) }} blocks
                        &nbsp;
                        <el-icon><AlarmClock /></el-icon> 
                    </el-link>
                </div>
                <div v-else>
                    -
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <div class="text-small text-bold">
            <div v-if="state.hasPoolStarted || !state.shouldShowBlockCountdown">
                Ends in
            </div>
            <div v-else>
                Starts in
            </div>
        </div>
        <div>
            <div v-if="state.shouldShowBlockCountdown">
                {{ numeralNumberFormat(state.blocksToDisplay, 0) }} blocks
                <el-link :href="viewCountdownOnBscUrl(state.hasPoolStarted ? endBlock : startBlock)" target="_blank" type="primary">
                    <el-icon><AlarmClock /></el-icon> 
                </el-link>
            </div>
            <div v-else>
                -
            </div>
        </div>
    </div>
</div>
</template>
<script>

import { getPoolBlockInfo } from '@/views/pool/helpers'
import BlockHook from '@/state/block/hooks'
import { reactive, watchEffect, computed } from 'vue'
import { numeralNumberFormat } from '@/lib/utils'
import { AlarmClock } from '@element-plus/icons-vue'
import { viewCountdownOnBscUrl } from '@/lib/utils'

export default {
    props: [
        'pool',
        'uiVersion',
    ],
    components: {
        AlarmClock,
    },
    setup(props) {

        const state = reactive({
            hasPoolStarted: false,
            shouldShowBlockCountdown: false,
        })

        const startBlock = computed(() => {
            return props.pool.startBlock
        })

        const endBlock = computed(() => {
            return props.pool.endBlock
        })

        watchEffect(async () => {
            if(!props.pool) {
                return
            }
            const blockHook = await BlockHook()
            const currentBlock = await blockHook.useCurrentBlock()
            
            const { 
                shouldShowBlockCountdown, 
                blocksUntilStart, 
                blocksRemaining, 
                hasPoolStarted, 
                blocksToDisplay } = getPoolBlockInfo(props.pool, currentBlock)

            state.hasPoolStarted = hasPoolStarted
            state.shouldShowBlockCountdown = shouldShowBlockCountdown
            state.blocksToDisplay = blocksToDisplay
        })

        return {
            state,
            numeralNumberFormat,
            startBlock,
            endBlock,
            viewCountdownOnBscUrl,
        }
    },
}
</script>