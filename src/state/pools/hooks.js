import { 
    fetchPoolsPublicDataAsync, 
    fetchPoolsStakingLimitsAsync, 
    fetchPoolsUserDataAsync } from '.'
import { getNonArchivedFarms, fetchFarmsPublicDataAsync } from '../farms'
import useWeb3Connect from '@/use/Web3Connect'

export const useFetchPublicPoolsData = async () => {

    const nonArchivedFarms = getNonArchivedFarms()
    const activeFarms = nonArchivedFarms.filter((farm) => farm.pid !== 0)
    fetchFarmsPublicDataAsync(activeFarms.map((farm) => farm.pid))

    await fetchPoolsPublicDataAsync()
    await fetchPoolsStakingLimitsAsync()
}

export const usePoolsPageFetch = async () => {
    useFetchPublicPoolsData()   
    const Web3Connect = useWeb3Connect()
    const account = Web3Connect.account
    if(account.value.address) {
        await fetchPoolsUserDataAsync(account.value.address)
    }
}