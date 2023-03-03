import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import Home from '../views/Home.vue'
import Liquidity from '../views/liquidity/index'
import AddLiquidity from '../views/liquidity/Add'
import RemoveLiquidity from '../views/liquidity/Remove'
import Swap from '../views/Swap.vue'
import Farm from '../views/Farm.vue'
import Pool from '../views/Pool.vue'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home
	},
	{
		path: '/about',
		name: 'About',
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
	},
	{
		path: '/liquidity',
		name: 'Liquidity',
		component: Liquidity,
	},
	{
		path: '/liquidity/add/:tokenAAddress?/:tokenBAddress?',
		name: 'AddLiquidity',
		component: AddLiquidity,
	},
	{
		path: '/liquidity/remove/:tokenAAddress/:tokenBAddress',
		name: 'RemoveLiquidity',
		component: RemoveLiquidity,
	},
	{
		path: '/liquidity/find',
		name: 'FindLiquidity',
		component: () => import(/* webpackChunkName: "FindLiquidity" */ '../views/liquidity/Find.vue')
	},
	{
		path: '/swap',
		name: 'Swap',
		component: Swap,
	},
	{
		path: '/farm',
		name: 'Farm',
		component: Farm,
	},
	{
		path: '/pool',
		name: 'Pool',
		component: Pool,
	},
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
})

router.beforeEach(async (to, from, next) => {
	await store.restored;
	next();
})

export default router
