import { getFarmsConfig } from '@/constant/config/farms'
import { fetchMasterChefFarmPoolLength } from '@/state/farms/fetchMasterChefData'
import isArchivedPid from '@/utils/farmHelpers'
import getPriceHelperLps from '@/constant/config/priceHelperLps'
import fetchFarms from '@/state/farms/fetchFarms'
import getFarmsPrices from '@/state/farms/getFarmsPrices'
import store from '@/store'
import { 
    fetchFarmUserAllowances, 
    fetchFarmUserTokenBalances,
    fetchFarmUserStakedBalances,
    fetchFarmUserEarnings
} from '@/state/farms/fetchFarmUser'
import useWeb3Connect from '@/use/Web3Connect'

const initFarmUserData = (farms) => {
    return farms.map((farm) => {
        return {
            ...farm,
            userData: {
                allowance: '0',
                tokenBalance: '0',
                stakedBalance: '0',
                earnings: '0',
            }
        }
    })
}

export const getNonArchivedFarms = () => {
    const farmsConfig = getFarmsConfig()
    return farmsConfig.filter(({ pid }) => !isArchivedPid(pid))
}

export const fetchFarmsPublicDataAsync = async (pids) => {
    const farmsConfig = getFarmsConfig()
    const priceHelperLpsConfig = getPriceHelperLps()
    const poolLength = await fetchMasterChefFarmPoolLength()
    const farmsToFetch = farmsConfig.filter((farmConfig) => pids.includes(farmConfig.pid))
    const farmsCanFetch = farmsToFetch.filter((f) => poolLength.gt(f.pid))
    const farmsWithPriceHelpers = farmsCanFetch.concat(priceHelperLpsConfig)
    const farms = await fetchFarms(farmsWithPriceHelpers)
    const farmsWithPrices = await getFarmsPrices(farms)

    const farmsWithoutHelperLps = farmsWithPrices.filter((farm) => {
        return farm.pid || farm.pid === 0
    })
    const farmWithUserData = initFarmUserData(farmsWithoutHelperLps)
    store.commit('updateFarms', farmWithUserData)
    return [farmWithUserData, poolLength.toNumber()]
}

export const fetchFarmUserDataAsync = async ({account, pids}) => {
    const farmsConfig = getFarmsConfig()
    const poolLength = await fetchMasterChefFarmPoolLength()
    const farmsToFetch = farmsConfig.filter((farmConfig) => pids.includes(farmConfig.pid))
    const farmsCanFetch = farmsToFetch.filter((f) => poolLength.gt(f.pid))
    const userFarmAllowances = await fetchFarmUserAllowances(account, farmsCanFetch)
    const userFarmTokenBalances = await fetchFarmUserTokenBalances(account, farmsCanFetch)
    const userStakedBalances = await fetchFarmUserStakedBalances(account, farmsCanFetch)
    const userFarmEarnings = await fetchFarmUserEarnings(account, farmsCanFetch)
    return userFarmAllowances.map((farmAllowance, index) => {
        return {
          pid: farmsCanFetch[index].pid,
          allowance: userFarmAllowances[index],
          tokenBalance: userFarmTokenBalances[index],
          stakedBalance: userStakedBalances[index],
          earnings: userFarmEarnings[index],
        }
    })
}

export const fetchFarm = async () => {

    const Web3Connect = useWeb3Connect()

    const account = Web3Connect.account

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

    store.commit('updateFarms', farmWithUserData)
    return {
        farmWithUserData,
        poolLength,
    }
}