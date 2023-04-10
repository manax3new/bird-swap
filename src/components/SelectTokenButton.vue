<template>
<div class="SelectTokenButton">
    <el-button @click="openSelectTokenDialog" class="custom-button-expand" style="width: 100%;">
        <div style="display: flex; align-items: center;">
            <TokenIcon size="small" :token="token"></TokenIcon>
            <div style="padding-left: 4px;">
                {{data.label}}
            </div>
        </div>
        <div>
            <el-icon>
                <ArrowDown />
            </el-icon>
        </div>
    </el-button>
    <el-dialog
    :title="selectTokenFragmentDialogTitle"
    v-model="data.selectTokenDialogVisible"
    width="50%">
        <template #header="{titleId, titleClass}">
            <div class="flex">
                <el-button
                v-if="data.selectTokenFragmentPage === 'manage'" 
                @click="() => { data.selectTokenFragmentPage = 'search' }"
                :icon="Back" 
                link></el-button>
                <div class="horizontal-space-10"></div>
                <span :id="titleId" :class="titleClass">{{ selectTokenFragmentDialogTitle }}</span>
            </div>
        </template>
        <SelectTokenFragment 
        @pageChanged="selectTokenFragmentPageChanged"
        @selectToken="selectTokenHandle" 
        :key="data.selectTokenFragmentKey" 
        :pairToken="pairToken"
        :page="data.selectTokenFragmentPage"></SelectTokenFragment>
    </el-dialog>
</div>
</template>
<script>

import { ArrowDown, Back } from '@element-plus/icons-vue'
import { reactive, watchEffect, computed } from 'vue'
import SelectTokenFragment from '@/components/SelectTokenFragment'
import TokenIcon from '@/components/TokenIcon'

export default {
    components: {
        ArrowDown,
        SelectTokenFragment,
        TokenIcon,
    },
    props: [
        'token',
        'pairToken',
    ],
    setup(props, context) {

        const data = reactive({
            label: '',
            selectTokenDialogVisible: false,
            selectTokenFragmentKey: 0,
            selectTokenFragmentPage: 'search',
        })

        watchEffect(() => {
            data.label = (props.token) ? props.token.symbol : 'Select a Token'
        })

        const selectTokenFragmentDialogTitle = computed(() => {
            if(data.selectTokenFragmentPage === 'search') {
                return 'Select a Token'
            } else if(data.selectTokenFragmentPage === 'manage') {
                return 'Manage'
            }
            return ''
        })

        const openSelectTokenDialog = () => {
            data.selectTokenFragmentKey = (new Date()).valueOf()
            data.selectTokenDialogVisible = true
            data.selectTokenFragmentPage = 'search'
        }

        const selectTokenHandle = (value) => {
            data.selectTokenDialogVisible = false
            context.emit('selectToken', value)
        }

        const selectTokenFragmentPageChanged = (page) => {
            data.selectTokenFragmentPage = page
        }

        return {
            data,
            openSelectTokenDialog,
            selectTokenHandle,
            selectTokenFragmentDialogTitle,
            selectTokenFragmentPageChanged,
            Back,
        }
    },
}
</script>