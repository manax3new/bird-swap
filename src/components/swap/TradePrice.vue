<template>
<div class="TradePrice">
    <div v-show="show">
        <el-space>
            <div>
                {{formattedPrice ?? '-'}} {{label}}
            </div>
            <el-button @click="revert" :icon="Refresh" size="small" circle />
        </el-space>
    </div>
</div>
</template>
<script>

import { computed, reactive } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

export default {
    props: [
        'price',
    ],
    setup(props, context) {

        const state = reactive({
            showInverted: false,
        })

        const formattedPrice = computed(() => {
            return state.showInverted ? props.price?.toSignificant(6) : props.price?.invert()?.toSignificant(6)
        })

        const show = computed(() => {
            return !!props.price?.baseCurrency && !!props.price?.quoteCurrency
        })

        const label = computed(() => {
            return state.showInverted
            ? `${props.price?.quoteCurrency?.symbol} per ${props.price?.baseCurrency?.symbol}`
            : `${props.price?.baseCurrency?.symbol} per ${props.price?.quoteCurrency?.symbol}`
        })

        const revert = () => {
            state.showInverted = !state.showInverted
            context.emit('showInvertedChange', state.showInverted)
        }

        return {
            formattedPrice,
            show,
            label,
            Refresh,
            revert
        }
    },
}
</script>