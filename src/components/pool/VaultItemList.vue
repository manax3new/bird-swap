<template>
    <div class="PoolVaultItemList">
        <el-card>
            <div class="item-list-header flex justify-content-space-around">
                <div>
                    <div v-if="isStaked" class="text-small text-primary">
                        STAKED
                    </div>
                    <div>
                        <!-- {{farm.farm.label}} -->
                        <div class="text-medium text-bold">
                            Earn BIRD
                        </div>
                        <div class="text-small">
                            Stake USDT
                        </div>
                    </div>
                </div>
                <div>
                    <div class="text-small text-bold">
                        BIRD Earned
                    </div>
                    <div class="text-medium">
                        <!-- {{farm.earned.earnings.toLocaleString()}} -->
                        0.00
                    </div>
                    <div class="text-small">
                        ~0.03 USD
                    </div>
                </div>
                <div>
                    <div class="text-small text-bold">
                        BIRD staked
                    </div>
                    <div>
                        0.0
                    </div>
                    <div>
                        0 USD
                    </div>
                </div>
                <div>
                    <div class="text-small text-bold">
                        APR
                    </div>
                    <div>
                        0.00%
                        <!-- <Apr :data="farm.apr"></Apr> -->
                    </div>
                </div>
                <div>
                    <div class="text-small text-bold">
                        Total staked
                    </div>
                    <div>
                        10 BIRD
                    </div>
                </div>
                <div>
                    <el-button v-if="state.isShowDetail" @click="toggleShowDetail" type="primary" :icon="ArrowUp" circle link />
                    <el-button v-else :icon="ArrowDown" @click="toggleShowDetail" type="primary" circle link />
                </div>
            </div>
            <div v-show="state.isShowDetail" class="flex item-list-body justify-content-space-around">
                <div>
                    <div>
                        <el-link type="primary" href="#" target="_blank">
                            View Project Site &nbsp;<el-icon><Link /></el-icon>
                        </el-link>
                    </div>
                    <div>
                        <el-link type="primary" href="#" target="_blank">
                            View Contract &nbsp;<el-icon><Link /></el-icon>
                        </el-link>
                    </div>
                    <div>
                        <el-link type="primary" href="#" target="_blank">
                            Add to Metamask &nbsp;<el-icon><Plus /></el-icon>
                        </el-link>
                    </div>
                </div>
                <el-card>
                    <div style="width: 250px;">
                        <div class="text-small">
                            <!-- {{ CAKE_TOKEN_INFO.symbol }} EARNED -->
                            BIRD EARN
                        </div>
                        <div class="flex justify-content-space-between align-items-center">
                            <div>
                                <!-- {{ farm.earned.earnings.toLocaleString() }} -->
                                0.00
                            </div>
                            <div>
                                <!-- <el-button 
                                @click="havest"
                                :disabled="(!canHarvest || isOnHavest)" 
                                type="primary" 
                                size="large">
                                    {{havestButtonLabel}}
                                </el-button> -->
                                <el-button type="primary">
                                    havest
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-card>
                <el-card>
                    <div style="width: 250px;">
                        stake action component
                        <!-- <StakedAction :farm="farm.details" :lpLabel="lpLabel" :displayApr="farm.apr.value"></StakedAction> -->
                    </div>
                </el-card>
            </div>
        </el-card>
    </div>
    </template>
    <script>
    
    import { QuestionFilled, ArrowDown, ArrowUp, Link, Plus, Minus } from '@element-plus/icons-vue'
    import { reactive, computed } from 'vue'
    
    export default {
        props: [
            'pool'
        ],
        components: {
            Link,
            Plus,
        },
        setup() {
    
            const state = reactive({
                isShowDetail: true,
            })
    
            const isStaked = computed(() => {
                return true
            })
    
            const toggleShowDetail = () => {
                state.isShowDetail = !state.isShowDetail
            }
    
            return {
                QuestionFilled,
                ArrowDown,
                ArrowUp,
                Link,
                Plus,
                Minus,
                state,
                isStaked,
                toggleShowDetail,
            }
        },
    }
    </script>
    <style scoped>
    .item-list-header {
        padding: 20px;
    }
    .item-list-body {
        padding: 20px;
        background-color: #18222c;
        border: solid 1px  #1d3043;
    }
    </style>
    <style>
    .PoolVaultItemList .el-card__body {
        padding: 0px;
    }
    .item-list-body .el-card__body {
        padding: 10px!important;
    }
    </style>