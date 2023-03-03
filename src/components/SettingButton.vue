<template>
<div class="SettingButton">
    <el-button @click="openSettingDialog" :icon="Setting" circle />
    <el-dialog
        v-model="settingDialogVisible"
        title="Settings"
        width="50%"
    >
        <div>
            <SettingFragment></SettingFragment>
        </div>
    </el-dialog>
</div>
</template>
<script>

import { Setting } from '@element-plus/icons-vue'
import { ref } from 'vue'
import SettingFragment from '@/components/SettingFragment'

export default {
    components: {
        SettingFragment,
    },
    setup() {

        const settingDialogVisible = ref(false)

        const openSettingDialog = () => {
            settingDialogVisible.value = true
        }

        return {
            Setting,
            openSettingDialog,
            settingDialogVisible,
        }
    },
}
</script>