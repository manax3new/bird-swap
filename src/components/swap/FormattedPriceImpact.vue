<template>
<div class="FormattedPriceImpact">
    <div :class="warningClass">
        {{label}}
    </div>
</div>
</template>
<script>

import { ONE_BIPS } from '@/constant/config'
import { computed } from 'vue'
import { warningSeverity } from '@/utils/prices'

export default {
    props: [
        'priceImpact',
    ],
    setup(props) {

        const label = computed(() => {
            return props.priceImpact ? (props.priceImpact.lessThan(ONE_BIPS) ? '<0.01%' : `${props.priceImpact.toFixed(2)}%`) : '-'
        })

        const warningLevel = computed(() => {
            return warningSeverity(props.priceImpact)
        })

        const warningClass = computed(() => {
            if(warningLevel.value === 4 || warningLevel.value === 3) {
                return 'text-red'
            } else if(warningLevel.value === 2) {
                return 'text-yellow'
            } else if(warningLevel.value === 1) {
                return ''
            } else {
                return 'text-green'
            }
        })

        return {
            label,
            warningClass,
        }
    },
}
</script>