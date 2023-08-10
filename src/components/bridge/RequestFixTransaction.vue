<template>
<div class="RequestFixTransaction">
    <div>
        <el-select v-model="form.chain" value-key="chainId" class="m-2" placeholder="Select source network">
            <el-option
                v-for="item in data.chains"
                :key="item.chainId"
                :label="item.name"
                :value="item"
                />
        </el-select>
    </div>
    <br>
    <div>
        Transfer transaction hash
    </div>
    <div>
        <el-input placeholder="fill your transaction hash" v-model="form.transactionHash"></el-input>
    </div>
    <br>
    <div>
        <el-button 
            type="primary" 
            class="custom-button-100percent"
            :disabled="!submitButtonIsAvailable"
            @click="request">
                {{ submitButtonLabel }}
            </el-button>
    </div>
</div> 
</template>
<script>

import CHAIN from '@/constant/Chain'
import { reactive, computed, onMounted } from 'vue'
import SmartInterval from '@/lib/SmartInterval'

export default {
    setup() {

        const data = reactive({
            chains: [],
            isOnRequest: false,
            countdownSecond: 0,
        })
        const form = reactive({
            chain: null,
            transactionHash: '',
        })
        let countDownInterval = null

        for(const chainKey in CHAIN) {
            data.chains.push(CHAIN[chainKey])
        }

        const submitButtonLabel = computed(() => {
            if(!form.chain || !form.transactionHash) {
                return `Fill form please`
            }
            if(data.isOnRequest) {
                return `Please wait...`
            }
            if(data.countdownSecond > 0) {
                return `Next request allow in ${data.countdownSecond} seconds.`
            }
            return `Submit`
        })

        const submitButtonIsAvailable = computed(() => {
            if(!form.chain || !form.transactionHash) {
                return false
            }
            if(data.isOnRequest) {
                return false
            }
            if(data.countdownSecond > 0) {
                return false
            }
            return true
        })

        const getInitCountdownSecond = () => {
            return 10
        }

        const request = async () => {

            data.isOnRequest = true

            console.log('form', form)

            data.countdownSecond = getInitCountdownSecond()

            data.isOnRequest = false

            startCountDown()
        }

        const startCountDown = () => {
            if(countDownInterval) {
                if(countDownInterval.stopped) {
                    countDownInterval.start()
                }
            } else {
                countDownInterval = SmartInterval(() => {
                    if(data.countdownSecond === 0) {
                        countDownInterval.stop()
                        return
                    }
                    data.countdownSecond--
                }, 1000)
            }
        }

        onMounted(() => {
            // data.countdownSecond = getInitCountdownSecond()
            startCountDown()
        })

        return {
            data,
            form,
            submitButtonLabel,
            submitButtonIsAvailable,
            request,
        }
    }
}
</script>