<template>
<div class="Pool wrapper-content">
    <h1>
        Pools
    </h1>
    <h3 class="text-sm">
        Just stake some tokens to earn.
        High APR, low risk.
    </h3>
    <div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style:solid;"><!--v-if--></div>
    <div class="flex justify-content-space-between">
        <div class="flex align-items-center">
            <div>
                <el-button type="primary" :icon="List" circle link />
            </div>
            <div>
                <el-button :icon="Grid" circle link/>
            </div>
            <div class="horizontal-space-5"></div>
            <el-switch v-model="filter.stakedOnly" />
            <div class="horizontal-space-2"></div>
            <div>
                Staked only
            </div>
            <div class="horizontal-space-5"></div>
            <div style="margin-right: 5px;">
                <el-button @click="() => { filter.isFinished = false }" :type="filter.isFinished ? '' : 'primary'" round>Live</el-button>
            </div>
            <div class="horizontal-space-2"></div>
            <div>
                <el-button @click="() => { filter.isFinished = true }" :type="filter.isFinished ? 'primary' : ''" round>Finished</el-button>
            </div>
        </div>
        <div class="flex align-items-center">
            <div>
                <span class="text-small text-bold">
                    SORT BY
                </span>
                <el-select v-model="filter.sortOption" placeholder="Select">
                    <el-option
                    v-for="item in SORT_BY_OPTIONS"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    />
                </el-select>
            </div>
            <div class="horizontal-space-5"></div>
            <span class="text-small text-bold" style="margin-right: 5px;">
                SEARCH
            </span>
            <div>

                <el-input v-model="filter.keyword"></el-input>
            </div>
        </div>
    </div>
    <div class="vertical-space-10"></div>
    <div class="vertical-space-10"></div>
    <div class="wrapper-table">
        <div v-for="(pool, key) of chosenPools" :key="key">
            <ItemList :pool="pool"></ItemList>
            <div class="vertical-space-10"></div>
        </div>
        <div class="flex-center">
            <el-button v-if="canLoadMore" @click="loadMore">Load More</el-button>
        </div>
    </div>
</div>
</template>
<script>

import { Grid, List } from '@element-plus/icons-vue'
import { reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import ItemList from '@/components/pool/ItemList'
import { transformPool } from '@/state/pools/helpers'
import store from '@/store'
import { usePoolsPageFetch } from '@/state/pools/hooks'
import partition from 'lodash/partition'
import BlockHook from '@/state/block/hooks'
import { BSC_BLOCK_TIME } from '@/constant/config'
import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import orderBy from 'lodash/orderBy'
import { latinise } from '@/utils/latinise'
import { BIG_ZERO } from '@/utils/bigNumber'
import useWeb3Connect from '@/use/Web3Connect'
import { getPoolConfig } from '@/constant/config/pools'
import { ElLoading } from 'element-plus'
import SmartInterval from '@/lib/SmartInterval'
import { FETCH_POOL_INTERVAL } from '@/constant/Values'

const POOL_START_BLOCK_THRESHOLD = (60 / BSC_BLOCK_TIME) * 4
const NUMBER_OF_POOLS_VISIBLE = 12

export default {
    components: {
        ItemList,
    },
    setup() {

        const Web3Connect = useWeb3Connect()
        const account = Web3Connect.account
        let fullScreenLoading = null
        let fetchPoolInterval = null

        const filter = reactive({
            stakedOnly: false,
            sortOption: 'hot',
            keyword: '',
            isFinished: false,
        })

        const SORT_BY_OPTIONS = [
            {
                label: 'Hot',
                value: 'hot',
            },
            {
                label: 'APR',
                value: 'apr',
            },
            {
                label: 'Earned',
                value: 'earned',
            },
            {
                label: 'Total staked',
                value: 'totalStaked',
            },
            {
                label: 'Latest',
                value: 'latest',
            },
        ]

        const data = reactive({
            initialBlock: 0,
            openPoolsWithStartBlockFilter: [],
            numberOfPoolsVisible: NUMBER_OF_POOLS_VISIBLE,
        })

        const pools = computed(() => {
            const poolFormated = store.state.pools.map((pool) => {
                return transformPool(pool)
            })
            return poolFormated
        })

        const partitioned = computed(() => {
            return partition(pools.value, (pool) => pool.isFinished)
        })

        const finishedPools = computed(() => {
            return partitioned.value[0]
        })

        const openPools = computed(() => {
            return partitioned.value[1]
        })

        const openPoolsWithStartBlockFilter = computed(() => {
            const initialBlock = data.initialBlock
            return openPools.value.filter((pool) =>
                initialBlock > 0 && pool.startBlock
                ? Number(pool.startBlock) < initialBlock + POOL_START_BLOCK_THRESHOLD
                : true,
            )
        })

        const stakedOnlyFinishedPools = computed(() => {
            return finishedPools.value.filter((pool) => {
                return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
            })
        })

        const stakedOnlyOpenPools = computed(() => {
            return openPoolsWithStartBlockFilter.value.filter((pool) => {
                return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
            })
        })

        const hasStakeInFinishedPools = computed(() => {
            return stakedOnlyFinishedPools.value.length > 0
        })

        const chosenPools = computed(() => {

            let considerPools = []

            if (filter.isFinished) {
                considerPools = filter.stakedOnly ? stakedOnlyFinishedPools.value : finishedPools.value
            } else {
                considerPools = filter.stakedOnly ? stakedOnlyOpenPools.value : openPoolsWithStartBlockFilter.value
            }

            const sortedPools = sortPools(account.value.address, filter.sortOption, pools.value, considerPools).slice(0, data.numberOfPoolsVisible)

            if (filter.keyword) {
                const lowercaseQuery = latinise(filter.keyword.toLowerCase())
                return sortedPools.filter((pool) => latinise(pool.earningToken.symbol.toLowerCase()).includes(lowercaseQuery))
            }
            return sortedPools
        })

        const needFetchPool = computed(() => {
            return store.state.needFetchPool
        })

        const canLoadMore = computed(() => {
            return parseInt(data.numberOfPoolsVisible) <= parseInt(chosenPools.value.length)
        })

        watch(needFetchPool, async (newVal) => {
            if(newVal) {
                await usePoolsPageFetch()
                store.dispatch('fetchPoolDone')
            }
        })

        const sortPools = (account, sortOption, pools, poolsToSort) => {
            switch (sortOption) {
                case 'apr':
                    // Ternary is needed to prevent pools without APR (like MIX) getting top spot
                    return orderBy(poolsToSort, (pool) => (pool.apr ? pool.apr : 0), 'desc')
                case 'earned':
                    return orderBy(
                        poolsToSort,
                        (pool) => {
                        if (!pool.userData || !pool.earningTokenPrice) {
                            return 0
                        }
                        return pool.userData.pendingReward.times(pool.earningTokenPrice).toNumber()
                        },
                        'desc',
                    )
                case 'totalStaked': {
                    const cakeInVaults = pools.reduce((total, pool) => {
                        if (pool.vaultKey) {
                            const vault = pool
                            if (vault.totalCakeInVault) {
                                return vault.totalCakeInVault.plus(total)
                            }
                            return total
                        }
                        return total
                    }, BIG_ZERO)
                    return orderBy(
                        poolsToSort,
                        (pool) => {
                        let totalStaked = Number.NaN
                        if (pool.vaultKey) {
                            const vault = pool
                            if (pool.stakingTokenPrice && vault.totalCakeInVault.isFinite()) {
                            totalStaked =
                                +formatUnits(EthersBigNumber.from(vault.totalCakeInVault.toString()), pool.stakingToken.decimals) *
                                pool.stakingTokenPrice
                            }
                        } else if (pool.sousId === 0) {
                            if (pool.totalStaked?.isFinite() && pool.stakingTokenPrice && cakeInVaults.isFinite()) {
                            const manualCakeTotalMinusAutoVault = EthersBigNumber.from(pool.totalStaked.toString()).sub(
                                cakeInVaults.toString(),
                            )
                            totalStaked =
                                +formatUnits(manualCakeTotalMinusAutoVault, pool.stakingToken.decimals) * pool.stakingTokenPrice
                            }
                        } else if (pool.totalStaked?.isFinite() && pool.stakingTokenPrice) {
                            totalStaked =
                            +formatUnits(EthersBigNumber.from(pool.totalStaked.toString()), pool.stakingToken.decimals) *
                            pool.stakingTokenPrice
                        }
                        return Number.isFinite(totalStaked) ? totalStaked : 0
                        },
                        'desc',
                    )
                }
                case 'latest':
                    return orderBy(poolsToSort, (pool) => Number(pool.sousId), 'desc')
                default:
                    return poolsToSort
            }
        }

        const loadMore = () => {
            if(!canLoadMore.value) {
                return
            }
            data.numberOfPoolsVisible += NUMBER_OF_POOLS_VISIBLE
        }

        onMounted(async () => {

            const poolsConfig = getPoolConfig()
            await store.dispatch('initPoolData', poolsConfig)

            fullScreenLoading = ElLoading.service({
                lock: true,
                text: 'Loading',
                background: 'rgba(0, 0, 0, 0.7)',
            })

            await usePoolsPageFetch()

            fullScreenLoading.close()

            const blockHook = await BlockHook()
            data.initialBlock = await blockHook.useInitialBlock()

            if(fetchPoolInterval) {
                if(fetchPoolInterval.stopped) {
                    fetchPoolInterval.start()
                }
            } else {
                fetchPoolInterval = SmartInterval(() => {
                    usePoolsPageFetch()
                }, FETCH_POOL_INTERVAL)
            }
        })

        onBeforeUnmount(() => {
            if(fetchPoolInterval) {
                fetchPoolInterval.stop()
            }
        })

        return {
            Grid,
            List,
            filter,
            SORT_BY_OPTIONS,
            data,
            hasStakeInFinishedPools,
            chosenPools,
            canLoadMore,
            loadMore,
        }
    }
}
</script>