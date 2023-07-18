<template>
    <div class="ApproveButton">
        <el-button 
        :class="customClass ? customClass: ''"
        :disabled="data.state === APPROVE_STATE.PENDING" 
        v-show="isShow" 
        @click="approve()"
        type="primary" plain>
            {{label}} {{token.symbol}}
        </el-button>
    </div>
</template>
<script>

import { reactive, watchEffect, computed, watch } from 'vue'
import { TokenAmount } from '@pancakeswap/sdk'
import { MaxUint256 } from '@ethersproject/constants'
import useERC20 from '@/use/ERC20'
import useParseSdkEntity from '@/use/ParseSdkEntity.js'
import APPROVE_STATE from '@/constant/ApproveState.js'
import { useGasPrice } from '@/state/user/hook'
import { calculateGasMargin, isEther } from '@/lib/utils.js'
import { ROUTER_ADDRESS } from '@/constant/config/Contract.js'
import validator from 'validator'
import { ElNotification } from 'element-plus'
import contractErrorExtract from '@/lib/contractErrorExtract.js'
import useWeb3Connect from '@/use/Web3Connect'

export default {
    props: [
        'token', 'owner', 'amount', 'customClass', 'spender',
    ],
    setup(props, context) {

        const Web3Connect = useWeb3Connect()
        const chainId = Web3Connect.chainId
        const web3 = Web3Connect.getWeb3()
        const ERC20 = useERC20(web3)
        const ParseSdkEntity = useParseSdkEntity()

        const spender = props.spender ? props.spender : ROUTER_ADDRESS[chainId.value]

        const data = reactive({
            pendingApproval: false,
            state: APPROVE_STATE.UNKNOWN,
        }) 

        const getAllowance = async (token, owner, spender) => {
            
            const allowance = await ERC20.allowance(token.address, owner, spender)
            return new TokenAmount(token, allowance.toString())
        }

        const calculateState = async (token, owner, amount, spender) => {

            if(!amount) {
                return APPROVE_STATE.UNKNOWN
            }
            if(!validator.isNumeric(amount)) {
                return APPROVE_STATE.UNKNOWN
            }

            if(isEther(token)) {
                return APPROVE_STATE.APPROVED
            }

            const toApproveAmountToken = ParseSdkEntity.fastCreateTokenAmount(token, amount)
            const currentAllowance = await getAllowance(toApproveAmountToken.token, owner, spender)

            if(!toApproveAmountToken || !spender) {
                return APPROVE_STATE.UNKNOWN
            }

            if(!currentAllowance) {
                return APPROVE_STATE.UNKNOWN
            }

            return currentAllowance.lessThan(toApproveAmountToken)
            ? data.pendingApproval
                ? APPROVE_STATE.PENDING
                : APPROVE_STATE.NOT_APPROVED
            : APPROVE_STATE.APPROVED
        }

        const isShow = computed(() => {
            return data.state === APPROVE_STATE.NOT_APPROVED || data.state === APPROVE_STATE.PENDING
        })

        const label = computed(() => {
            return data.state === APPROVE_STATE.PENDING ? 'Enabling...' : 'Enable'
        })

        watchEffect(async () => {
            data.state = await calculateState(props.token, props.owner, props.amount, spender)
        })

        watch(() => data.state, (newVal) => {
            context.emit('approvalChange', newVal === APPROVE_STATE.APPROVED)
        })

        const approve = async () => {

            const token = props.token
            const tokenContract = await ERC20.getTokenContract(token.address)
            const toApproveAmountToken = ParseSdkEntity.fastCreateTokenAmount(props.token, props.amount)
            const owner = props.owner

            if (data.state !== APPROVE_STATE.NOT_APPROVED) {
                console.error('approve was called unnecessarily')
                return
            }
            if (!token) {
                console.error('no token')
                return
            }

            if (!tokenContract) {
                console.error('tokenContract is null')
                return
            }

            if (!toApproveAmountToken) {
                console.error('missing amount to approve')
                return
            }

            if (!spender) {
                console.error('no spender')
                return
            }

            data.state = APPROVE_STATE.PENDING

            let useExact = false
            let estimatedGas = 0
            try {
                estimatedGas = await tokenContract.methods.approve(spender, MaxUint256).estimateGas({from: owner})
            } catch(error) {
                useExact = true
                estimatedGas = await tokenContract.methods.approve(spender, toApproveAmountToken.raw.toString()).estimateGas({from: owner})
            }

            estimatedGas = calculateGasMargin(estimatedGas)

            const gasPrice = useGasPrice()

            try {

                const tx = tokenContract.methods.approve(spender, useExact ? toApproveAmountToken.raw.toString() : MaxUint256)
                const receipt = await tx.send({
                    from: owner,
                    gas: estimatedGas,
                    gasPrice: gasPrice,
                })

                const transactionHash = receipt.transactionHash

                console.log('receipt', receipt)
                console.log('transactionHash', transactionHash)

                data.state = APPROVE_STATE.APPROVED

                data.state = await calculateState(props.token, props.owner, props.amount, spender)

            } catch (error) {
                console.log('approve error', error.message)
                data.state = APPROVE_STATE.NOT_APPROVED
                ElNotification({
                    title: 'Enable fail',
                    message: contractErrorExtract(error.message),
                    duration: 0,
                })
            }
        }

        return {
            data,
            isShow,
            label,
            approve,
            APPROVE_STATE,
        }
        
    },
}
</script>