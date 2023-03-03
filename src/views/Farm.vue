<template>
<div class="Farm">
    <h1>
        Farms
    </h1>
    <h3>
        Stake LP tokens to earn.
    </h3>
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
            <div>
                <el-button @click="() => { filter.isFinished = false }" :type="filter.isFinished ? '' : 'primary'" round>Live</el-button>
            </div>
            <div class="horizontal-space-2"></div>
            <div>
                <el-button @click="() => { filter.isFinished = true }" :type="filter.isFinished ? 'primary' : ''" round>Finished</el-button>
            </div>
        </div>
        <div class="flex align-items-center">
            <div>
                <div class="text-small">
                    SORT BY
                </div>
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
            <div>
                <div class="text-small">
                    SEARCH
                </div>
                <el-input v-model="filter.keyword"></el-input>
            </div>
        </div>
    </div>
    <div class="vertical-space-10"></div>
    <div class="vertical-space-10"></div>
    <!-- <pre>
        {{rowData}}
    </pre> -->
    <div>
        <div v-for="(farm, key) of rowData" :key="key">
            <ItemList :farm="farm"></ItemList>
            <div class="vertical-space-10"></div>
        </div>
    </div>
    <div class="flex-center">
        <el-button v-if="canLoadMore" @click="loadMore">Load More</el-button>
    </div>
</div>    
</template>
<script>

import { Grid, List } from '@element-plus/icons-vue'
import { reactive, ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import ItemList from '@/components/farm/ItemList'
import { fetchFarmsPublicDataAsync, getNonArchivedFarms, fetchFarmUserDataAsync } from '@/state/farms'
import { getFarmsConfig } from '@/constant/config/farms'
import isArchivedPid from '@/utils/farmHelpers'
import BigNumber from 'bignumber.js'
import { farmFormatter } from '@/state/farms/hook'
import { getFarmApr } from '@/utils/apr'
import { ChainId } from '@pancakeswap/sdk'
import usePriceCakeBusd from '@/use/PriceCakeBusd'
import orderBy from 'lodash/orderBy'
import { getBalanceNumber } from '@/utils/formatBalance'
import useWeb3Connect from '@/use/Web3Connect'
import store from '@/store'
import { ElLoading } from 'element-plus'
import SmartInterval from '@/lib/SmartInterval'
import { FETCH_FARM_INTERVAL } from '@/constant/Values'

const NUMBER_OF_FARMS_VISIBLE = 12

export default {
    components: {
        ItemList,
    },
    setup() {

        const Web3Connect = useWeb3Connect()
        let fullScreenLoading = null
        let fetchFarmInterval = null

        const account = Web3Connect.account

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
                label: 'Multiplier',
                value: 'multiplier',
            },
            {
                label: 'Earned',
                value: 'earned',
            },
            {
                label: 'Liquidity',
                value: 'liquidity',
            },
            {
                label: 'Latest',
                value: 'latest',
            },
        ]

        const farmData = reactive({
            farmWithUserData: [],
            poolLength: 0,
            farmsLP: [],
        })

        const isArchived = ref(false)
        const numberOfFarmVisible = ref(NUMBER_OF_FARMS_VISIBLE)

        const isInactive = computed(() => {
            return filter.isFinished
        })

        const isActive = computed(() => {
            return !isArchived.value && !isInactive.value
        })

        const needFetchFarm = computed(() => {
            return store.state.needFetchFarm
        })

        const farmsLP = computed(() => {
            return farmFormatter(farmData.farmWithUserData)
        })

        const activeFarms = computed(() => {
            return farmsLP.value.filter(
                (farm) =>
                farm.pid !== 0 && farm.multiplier !== '0X' && !isArchivedPid(farm.pid) && (!farmData.poolLength || farmData.poolLength > farm.pid),
            )
        })
        const inactiveFarms = computed(() => {
            return farmsLP.value.filter((farm) => farm.pid !== 0 && farm.multiplier === '0X' && !isArchivedPid(farm.pid))
        })
        const archivedFarms = computed(() => {
            return farmsLP.value.filter((farm) => isArchivedPid(farm.pid))
        })
        const stakedOnlyFarms = computed(() => {
            return activeFarms.value.filter(
                (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
            )
        })
        const stakedInactiveFarms = computed(() => {
            return inactiveFarms.value.filter(
                (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
            )
        })
        const stakedArchivedFarms = computed(() => {
            return archivedFarms.value.filter(
                (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
            )
        })

        const chosenFarmsMemoized = computed(() => {

            let chosenFarms = []

            const sortFarms = (farms) => {
                switch (filter.sortOption) {
                    case 'apr':
                        return orderBy(farms, (farm) => farm.apr + farm.lpRewardsApr, 'desc')
                    case 'multiplier':
                        return orderBy(
                            farms,
                            (farm) => (farm.multiplier ? Number(farm.multiplier.slice(0, -1)) : 0),
                            'desc',
                        )
                    case 'earned':
                        return orderBy(
                            farms,
                            (farm) => (farm.userData ? Number(farm.userData.earnings) : 0),
                            'desc',
                        )
                    case 'liquidity':
                        return orderBy(farms, (farm) => Number(farm.liquidity), 'desc')
                    case 'latest':
                        return orderBy(farms, (farm) => Number(farm.pid), 'desc')
                    default:
                        return farms
                }
            }

            if(isActive.value) {
                chosenFarms = filter.stakedOnly ? farmsList(stakedOnlyFarms.value) : farmsList(activeFarms.value)
            }
            if(isInactive.value) {
                chosenFarms = filter.stakedOnly ? farmsList(stakedInactiveFarms.value) : farmsList(inactiveFarms.value)
            }
            if(isArchived.value) {
                chosenFarms = filter.stakedOnly ? farmsList(stakedArchivedFarms.value) : farmsList(archivedFarms.value)
            }
            
            return sortFarms(chosenFarms).slice(0, numberOfFarmVisible.value)
        })

        const rowData = computed(() => {

            const getDisplayApr = (cakeRewardsApr, lpRewardsApr) => {
                if (cakeRewardsApr && lpRewardsApr) {
                    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
                }
                if (cakeRewardsApr) {
                    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
                }
                return null
            }

            const cakePrice = usePriceCakeBusd()

            return chosenFarmsMemoized.value.map((farm) => {

                const { token, quoteToken } = farm
                const tokenAddress = token.address
                const quoteTokenAddress = quoteToken.address
                const lpLabel = farm.lpSymbol && farm.lpSymbol.split(' ')[0].toUpperCase().replace('PANCAKE', '')

                const row = {
                    apr: {
                        value: getDisplayApr(farm.apr, farm.lpRewardsApr),
                        pid: farm.pid,
                        multiplier: farm.multiplier,
                        lpLabel,
                        lpSymbol: farm.lpSymbol,
                        tokenAddress,
                        quoteTokenAddress,
                        cakePrice,
                        originalValue: farm.apr,
                    },
                    farm: {
                        label: lpLabel,
                        pid: farm.pid,
                        token: farm.token,
                        quoteToken: farm.quoteToken,
                    },
                    earned: {
                        earnings: getBalanceNumber(new BigNumber(farm.userData.earnings)),
                        pid: farm.pid,
                    },
                    liquidity: {
                        liquidity: farm.liquidity,
                    },
                    multiplier: {
                        multiplier: farm.multiplier,
                    },
                    details: farm,
                }

                return row
            })
        })

        const canLoadMore = computed(() => {
            return parseInt(numberOfFarmVisible.value) <= parseInt(chosenFarmsMemoized.value.length)
        })

        watch(needFetchFarm, async (newVal) => {
            if(newVal) {
                await fetchFarm()
                store.dispatch('fetchFarmDone')
            }
        })

        const fetchFarm = async () => {

            const includeArchive = false

            const farmsConfig = getFarmsConfig()
            const nonArchivedFarms = getNonArchivedFarms()

            const farmsToFetch = includeArchive ? farmsConfig : nonArchivedFarms
            const pids = farmsToFetch.map((farmToFetch) => farmToFetch.pid)
            
            const [farmsPublicData, poolLength] = await fetchFarmsPublicDataAsync(pids)
            
            let farmWithUserData = [...farmsPublicData]
            if(account.value.address) {
                const farmsUserData = await fetchFarmUserDataAsync({account: account.value.address, pids})
                farmWithUserData = farmsPublicData.map((farm) => {
                    const userData = farmsUserData.find((farmUserData) => {
                        return parseInt(farmUserData.pid) === parseInt(farm.pid)
                    })
                    return {
                        ...farm,
                        userData,
                    }
                })
            }

            farmData.farmWithUserData = farmWithUserData
            farmData.poolLength = poolLength

            store.commit('updateFarms', farmWithUserData)

            return {
                farmWithUserData,
                poolLength,
            }
        }

        const loadFarms = async () => {

            fullScreenLoading = ElLoading.service({
                lock: true,
                text: 'Loading',
                background: 'rgba(0, 0, 0, 0.7)',
            })

            await fetchFarm()

            fullScreenLoading.close()
        }

        const farmsList = (farmsToDisplay) => {

            const cakePrice = usePriceCakeBusd()

            let farmsToDisplayWithAPR = farmsToDisplay.map((farm) => {
                if (!farm.lpTotalInQuoteToken || !farm.quoteTokenPriceBusd) {
                    return farm
                }
                const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteTokenPriceBusd)
                const { cakeRewardsApr, lpRewardsApr } = isActive.value
                    ? getFarmApr(new BigNumber(farm.poolWeight), cakePrice, totalLiquidity, farm.lpAddresses[ChainId.MAINNET])
                    : { cakeRewardsApr: 0, lpRewardsApr: 0 }

                return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
            })

            if(filter.keyword) {
                farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm) => {
                    return farm.lpSymbol.toLowerCase().includes(filter.keyword.toLowerCase())
                })
            }

            return farmsToDisplayWithAPR
        }

        const loadMore = () => {
            if(!canLoadMore.value) {
                return
            }
            numberOfFarmVisible.value += NUMBER_OF_FARMS_VISIBLE
        }

        onMounted(async () => {

            await loadFarms()

            if(fetchFarmInterval) {
                if(fetchFarmInterval.stopped) {
                    fetchFarmInterval.start()
                }
            } else {
                fetchFarmInterval = SmartInterval(() => {
                    store.dispatch('requestForFetchFarm')
                }, FETCH_FARM_INTERVAL)
            }
        })

        onBeforeUnmount(() => {
            if(fetchFarmInterval) {
                fetchFarmInterval.stop()
            }
        })

        return {
            Grid,
            List,
            filter,
            SORT_BY_OPTIONS,
            rowData,
            canLoadMore,
            loadMore,
        }
    },
}
</script>