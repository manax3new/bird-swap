<template>
    <div id="nav" class="flex align-items-center justify-content-space-between">
        <el-space>
            <router-link to="/">Home</router-link> |
            <router-link to="/about">About</router-link> |
            <router-link to="/liquidity">Liquidity</router-link> |
            <router-link to="/swap">Swap</router-link> |
            <router-link to="/farm">Farms</router-link> |
            <router-link to="/pool">Pools</router-link>
        </el-space>
        <div class="flex align-items-center">
            <div class="flex align-items-center" v-if="account.address">
                <el-space>
                    <div class="text-bold">{{network.name}}</div>
                    <div>|</div>
                    <div>Account: </div>
                    <div class="text-truncate-100 text-bold">{{account.address}}</div>
                    <div>|</div>
                    <div class="text-bold">{{bnbBalanceFormat(account.balance, 4)}}</div>
                    <div>BNB</div>
                </el-space>
            </div>
            <ConnectWallet></ConnectWallet>
        </div>
    </div>
    <router-view v-if="isWeb3Ready" :key="`${network.id}:${account.address}`" />
</template>

<script>

import useWeb3Connect from '@/use/Web3Connect'
import { onMounted, ref } from 'vue'
import ConnectWallet from '@/components/ConnectWallet'
import { bnbBalanceFormat } from '@/lib/utils'
import BigNumber from 'bignumber.js'

export default {

    components: {
        ConnectWallet,
    },
    setup() {

        BigNumber.config({
            EXPONENTIAL_AT: 1000,
            DECIMAL_PLACES: 80,
        })

        const Web3Connect = useWeb3Connect()

        const isWeb3Ready = ref(false) 

        const account = Web3Connect.account
        const network = Web3Connect.network
        
        onMounted(async () => {
            await Web3Connect.initWeb3()
            const web3 = Web3Connect.getWeb3()
            if (web3) {
                await Web3Connect.loadAppInfo()
            }
            isWeb3Ready.value = true
        })

        return {
            isWeb3Ready,
            account,
            bnbBalanceFormat,
            network,
        }
    }
}
</script>

<style lang="scss">
body {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
#app {
    // text-align: center;
    color: #2c3e50;
}

#nav {
    padding: 30px;

    a {
        font-weight: bold;
        color: #2c3e50;

        &.router-link-exact-active {
            color: #42b983;
        }
    }
}

.top-of-every-thing {
    z-index: 10000!important;
}
.el-notification__content {
    text-align: unset!important;
}
.custom-button-expand {
    width: 200px;
}
.custom-button-expand span{
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.custom-button-100percent {
    width: 100%;
}

.flex {
    display: flex;
}
.flex-center {
    display: flex;
    justify-content: center;
}
.justify-content-center {
    justify-content: center;
}
.justify-content-space-between {
    justify-content: space-between;
}
.justify-content-space-around {
    justify-content: space-around;
}
.align-items-center {
    align-items: center;
}
.text-align-right {
    text-align: right;
}
.text-align-center {
    text-align: center;
}

.text-bold {
    font-weight: bold;
}
.text-truncate-100 {
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.text-x-small {
    font-size: x-small;
}
.text-small {
    font-size: small;
}
.text-large {
    font-size: large;
}
.text-x-large {
    font-size: x-large;
}
.text-xx-large {
    font-size: xx-large;
}
.text-red {
    color: red;
}
.text-yellow {
    color: #CCCC00;
}
.text-green {
    color: green;
}
.text-primary {
    color: #409eff;
}
.text-gray {
    color: gray;
}
.text-white {
    color: white;
}

.vertical-space-10 {
    height: 10px;
}
.horizontal-space-2 {
    width: 2px;
}
.horizontal-space-5 {
    width: 5px;
}
.horizontal-space-10 {
    width: 10px;
}

.no-padding {
    padding: 0!important;
}
.no-margin {
    margin: 0!important;
}

</style>
