<template>
<div class="SettingFragment">
    <div class="text-bold">
        GLOBAL
    </div>
    <br>
    <div class="flex align-items-center">
        Default Transaction Speed (GWEI)
        <el-tooltip
            effect="dark"
            content="Adjusts the gas price (transaction fee) for your transaction. Higher GWEI = higher speed = higher fees"
        >
            <el-icon><QuestionFilled /></el-icon>
        </el-tooltip>
    </div>
    <div class="vertical-space-10"></div>
    <div>
        <el-button 
        @click="setGasPrice(gasPrice.value)" 
        v-for="(gasPrice, key) of GAS_PRICES" 
        :key="key" 
        :plain="!compareCurrentGasPrice(gasPrice.value)" 
        type="primary" 
        round>
            <span>{{gasPrice.label}}</span>
        </el-button>
    </div>
    <el-divider/>
    <div class="text-bold">
        SWAP & LIQUIDITY
    </div>
    <br>
    <div class="flex align-items-center">
        Slippage Tolerance
        <el-tooltip
            effect="dark"
            content="Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution."
        >
            <el-icon><QuestionFilled /></el-icon>
        </el-tooltip>
    </div>
    <div class="vertical-space-10"></div>
    <div class="flex">
        <el-space>
            <el-button 
            @click="setSlippage(slippage.value)"
            v-for="(slippage, key) of SLIPPAGE_TOLERANCES" 
            :key="key" 
            :plain="!compareCurrentSlippage(slippage.value)" 
            type="primary" 
            round>
                {{slippage.label}}
            </el-button>
            <el-input style="width: 70px;" v-model="form.slippageCustom" type="text"></el-input>
        </el-space>
    </div>
    <br>
    <div class="flex justify-content-space-between">
        <div class="flex align-items-center">
            Tx deadline (mins)
            <el-tooltip
                effect="dark"
                content="Your transaction will revert if it is left confirming for longer than this time."
            >
                <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
        </div>
        <div>
            <el-input style="width: 50px;" type="text" v-model="form.deadline"></el-input>
        </div>
    </div>
</div>
</template>
<script>

import { QuestionFilled } from '@element-plus/icons-vue'
import { useUserSlippageTolerance, useGasPrice } from '@/state/user/hook'
import { reactive, watch, computed } from 'vue'
import { parseUnits } from '@ethersproject/units'
import store from '@/store'

export default {
    components: {
        QuestionFilled,
    },
    setup() {
        
        const GAS_PRICES = [
            {
                label: 'Standard(5)',
                value: parseUnits('5', 'gwei').toString()
            },
            {
                label: 'Fast(6)',
                value: parseUnits('6', 'gwei').toString()
            },
            {
                label: 'Instant(7)',
                value: parseUnits('7', 'gwei').toString()
            },
        ]
        const SLIPPAGE_TOLERANCES = [
            {
                label: '0.1%',
                value: 10,
            },
            {
                label: '0.5%',
                value: 50,
            },
            {
                label: '1.0%',
                value: 100,
            },
        ]

        const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance()

        const getSlippageCustom = computed(() => {
            if(parseFloat(userSlippageTolerance.value) === 10 
            || parseFloat(userSlippageTolerance.value) === 50 
            || parseFloat(userSlippageTolerance.value) === 100) {
                return ''
            } else {
                return parseFloat(userSlippageTolerance.value) / 100
            }
        })

        const form = reactive({
            gasPrice: useGasPrice(),
            slippage: userSlippageTolerance.value,
            slippageCustom: getSlippageCustom.value,
            deadline: store.state.userDeadline,
        })

        watch(() => form.slippage, (newVal) => {
            if(parseFloat(newVal) === 10 
            || parseFloat(newVal) === 50 
            || parseFloat(newVal) === 100) {
                form.slippageCustom = ''
            } else {
                form.slippageCustom = parseFloat(userSlippageTolerance.value) / 100
            }
        })

        watch(() => form.slippageCustom, (newVal) => {
            if(newVal) {
                const calculatedValue = parseFloat(newVal) * 100
                setSlippage(calculatedValue)
            }
        })

        watch(() => form.deadline, (newVal) => {
            if(newVal) {
                const calculateValue = parseInt(newVal)
                setDeadline(calculateValue)
            }
        })

        const compareCurrentGasPrice = (gasPrice) => {
            return parseInt(form.gasPrice) === parseInt(gasPrice)
        }

        const setGasPrice = (gasPrice) => {
            form.gasPrice = gasPrice
            store.commit('updateUserGasPrice', gasPrice)
        }

        const compareCurrentSlippage = (slippage) => {
            return parseInt(form.slippage) === parseInt(slippage)
        }

        const setSlippage = (slippage) => {
            form.slippage = slippage
            setUserSlippageTolerance(slippage)
        }

        const setDeadline = (deadline) => {
            store.commit('updateUserDeadline', deadline)
        }

        return {
            GAS_PRICES,
            SLIPPAGE_TOLERANCES,
            form,
            compareCurrentGasPrice,
            setGasPrice,
            compareCurrentSlippage,
            setSlippage,
        }
    },
}
</script>