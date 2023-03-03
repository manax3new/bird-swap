import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'
import localForage from 'localforage'
import { parseUnits } from '@ethersproject/units'
const vuexLocal = new VuexPersistence({
    storage: localForage,
	asyncStorage: true,
	reducer: (state) => ({
		userSavePairs: state.userSavePairs,
		userDeadline: state.userDeadline,
		userSlippageTolerance: state.userSlippageTolerance,
		userGasPrice: state.userGasPrice,
		userAddedTokens: state.userAddedTokens,
	})
});

export default createStore({
	state: {
		network: {
			id: 0,
			name: '',
		},
		account: {
			address: '',
			balance: 0,
		},
		tokenInfoMap: {},
		userSavePairs: JSON.stringify([]),
		userDeadline: 20,
		userSlippageTolerance: 50,
		userGasPrice: parseUnits('5', 'gwei').toString(),
		farms: [],
		needFetchFarm: false,
		userAddedTokens: JSON.stringify([]),
		pools: [],
		needFetchPool: false,
	},
	mutations: {
		updateNetwork(state, value) {
			state.network = value
		},
		updateAccountAddress(state, value) {
			state.account.address = value
		},
		updateAccountBalance(state, value) {
			state.account.balance = value
		},
		updateTokenInfoMap(state, value) {
			if(value && value.key && value.value) {
				state.tokenInfoMap[value.key] = value.value
			}
		},
		updateUserSavePairs(state, value) {
			state.userSavePairs = value
		},
		updateUserDeadline(state, value) {
			state.userDeadline = value
		},
		updateUserSlippageTolerance(state, value) {
			state.userSlippageTolerance = value
		},
		updateUserGasPrice(state, value) {
			state.userGasPrice = value
		},
		updateFarms(state, value) {
			state.farms = value
		},
		updateNeedFetchFarm(state, value) {
			state.needFetchFarm = value
		},
		updateUserAddedTokens(state, value) {
			state.userAddedTokens = value
		},
		updatePools(state, value) {
			state.pools = value
		},
		updateNeedFetchPool(state, value) {
			state.needFetchPool = value
		},
	},
	actions: {
		addUserSavePairs({commit, state}, tokens) {
			const userSavePairs = JSON.parse(state.userSavePairs)
			const exist = userSavePairs.find((pair) => {
				return pair[0].address.toString() === tokens[0].address.toString() && pair[1].address.toString() === tokens[1].address.toString()
			})
			if(exist) {
				return
			}
			userSavePairs.push(tokens)
			commit('updateUserSavePairs', JSON.stringify(userSavePairs))
		},
		requestForFetchFarm({commit}) {
			commit('updateNeedFetchFarm', true)
		},
		fetchFarmDone({commit}) {
			commit('updateNeedFetchFarm', false)
		},
		requestForFetchPool({commit}) {
			commit('updateNeedFetchPool', true)
		},
		fetchPoolDone({commit}) {
			commit('updateNeedFetchPool', false)
		},
		addUserAddedTokens({commit, state}, token) {
			const userAddedTokens = JSON.parse(state.userAddedTokens)
			const exist = userAddedTokens.find((userAddedToken) => {
				return userAddedToken.address.toLowerCase() === token.address.toLowerCase()
			})
			if(exist) {
				return
			}
			userAddedTokens.push(token)
			commit('updateUserAddedTokens', JSON.stringify(userAddedTokens))
		},
		removeUserAddedTokens({commit, state}, token) {
			const userAddedTokens = JSON.parse(state.userAddedTokens)
			const existIndex = userAddedTokens.findIndex((userAddedToken) => {
				return userAddedToken.address.toLowerCase() === token.address.toLowerCase()
			})
			if(existIndex === -1) {
				return
			}
			userAddedTokens.splice(existIndex, 1)
			commit('updateUserAddedTokens', JSON.stringify(userAddedTokens))
		},
		clearAllUserAddedTokens({commit}) {
			commit('updateUserAddedTokens', JSON.stringify([]))
		},
		async initPoolData({commit}, poolsConfig) {
			commit('updatePools', poolsConfig)
		},
		async setPoolsPublicData({commit, state}, livePoolsData) {
			const pools = state.pools
			const updated = pools.map((pool) => {
				const livePoolData = livePoolsData.find((entry) => {
					return entry.sousId === pool.sousId
				})
				return {
					...pool,
					...livePoolData,
				}
			})
			commit('updatePools', updated)
		},
		async setPoolsUserData({commit, state}, userData) {
			const pools = state.pools
			const updated = pools.map((pool) => {
				const userPoolData = userData.find((entry) => {
					return entry.sousId === pool.sousId
				})
				return {
					...pool,
					userData: userPoolData,
				}
			})
			commit('updatePools', updated)
		}
	},
	plugins: [vuexLocal.plugin],
})
