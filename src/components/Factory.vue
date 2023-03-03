<template>
    <div v-if="isContractReady" class="Factory">
        <div>feeTo: <strong>{{feeTo}}</strong></div>
        <div>feeToSetter: <strong>{{feeToSetter}}</strong></div>
        <div>allPairsLength: <strong>{{allPairsLength}}</strong></div>
        <div v-for="(pair, key) of allPairs" :key="key">
            <div @click="selectPair(pair)" style="border: solid black 1px;">
                <div>address: <strong>{{pair.address}}</strong></div>
                <div>token0: <strong>{{pair.token0}}</strong> token1: <strong>{{pair.token1}}</strong></div>
            </div>
        </div>
        <br>
        <div>
            <div>
                setFeeTo: <input v-model="form.feeTo" type="text"/><button @click="setFeeTo">ok</button>
            </div>
            <div v-if="form.feeToTransactionHash">
                transactionHash: <strong>{{form.feeToTransactionHash}}</strong>
            </div>
        </div>
        <br>
        <!-- <div>
            <div>
                <strong>getPair</strong>
            </div>
            <div>
                <div>tokenA: <input v-model="getPairForm.tokenA" type="text"/></div>
                <div>tokenB: <input v-model="getPairForm.tokenB" type="text"/></div>
                <div><button @click="getPair">get</button></div>
            </div>
            <div v-if="pair">pair: <strong>{{pair}}</strong></div>
        </div>
        <br> -->
        <div>
            <div>
                <strong>createPair</strong>
            </div>
            <div>
                <div>tokenA: <input v-model="createPairForm.tokenA" type="text"/></div>
                <div>tokenB: <input v-model="createPairForm.tokenB" type="text"/></div>
                <div><button @click="createPair">create</button></div>
            </div>
            <div v-if="createPairForm.transactionHash">
                transactionHash: <strong>{{createPairForm.transactionHash}}</strong>
            </div>
        </div>
        <br/>
        <div>
            <strong>TOKEN</strong>
        </div>
        <div v-if="selectedPair">
            <ERC20Token :address="selectedPair.token0"></ERC20Token>
            <ERC20Token :address="selectedPair.token1"></ERC20Token>
        </div>
    </div>
</template>
<script>

import factoryContract from '../../../eattheblocks-fork-uniswap/core/build/contracts/UniswapV2Factory.json'
import PairContract from '../../../eattheblocks-fork-uniswap/core/build/contracts/UniswapV2Pair.json'
import store from '@/store'
import contractErrorExtract from '@/lib/contractErrorExtract.js'
import ERC20Token from './ERC20Token.vue'

export default {
    name: 'Factory',
    components: {
        ERC20Token,
    },
    data() {
        return {
            factoryContract: null,
            pairContract: null,
            feeTo: '',
            feeToSetter: '',
            allPairsLength: 0,
            allPairs: [],
            form: {
                feeTo: '',
                feeToTransactionHash: '',
            },
            createPairForm: {
                tokenA: '',
                tokenB: '',
                transactionHash: '',
            },
            getPairForm: {
                tokenA: '',
                tokenB: '',
            },
            pair: '',
            selectedPair: null,
        }
    },
    computed: {
        isContractReady() {
            return this.factoryContract
        },
        web3() {
            return this.$web3
        },
        network() {
            return store.state.network
        },
        account() {
            return store.state.account
        },
    },
    methods: {
        async loadFactoryContract() {

			this.factoryContract = new this.web3.eth.Contract(factoryContract.abi, factoryContract.networks[this.network.id].address)
			
            this.loadFeeTo()
            this.loadFeeToSetter()
            this.loadPairs()
		},
        async loadFeeTo() {
            const feeTo = await this.factoryContract.methods.feeTo().call()
			this.feeTo = feeTo
        },
        async loadFeeToSetter() {
            const feeToSetter = await this.factoryContract.methods.feeToSetter().call()
            this.feeToSetter = feeToSetter
        },
        async loadPairs() {
            const allPairsLength = await this.factoryContract.methods.allPairsLength().call();
            this.allPairsLength = allPairsLength
			for(let i = 0;i < allPairsLength;i++) {
				const pair = await this.factoryContract.methods.allPairs(i).call();
                const {token0, token1} = await this.loadPairToken(pair)
                this.allPairs.push({
                    address: pair,
                    token0,
                    token1,
                })
			}
        },
        async loadPairToken(pairAddress) {
            this.pairContract = new this.web3.eth.Contract(PairContract.abi, pairAddress)
            const token0 = await this.pairContract.methods.token0().call()
            const token1 = await this.pairContract.methods.token1().call()
            return {token0, token1}
        },
        async setFeeTo() {

            try {

                this.form.feeToTransactionHash = ''

                const tx = this.factoryContract.methods.setFeeTo(this.form.feeTo);
                const gas = await tx.estimateGas({from: this.account.address})

                const receipt = await this.factoryContract.methods.setFeeTo(this.account.address).send({
                    from: this.account.address,
                    gas: gas,
                })
                this.form.feeToTransactionHash = receipt.transactionHash
                this.loadFeeTo()
                this.form.feeTo = ''

            } catch (error) {
                const errorMessage = contractErrorExtract(error.message)
                console.log('setFeeTo error', errorMessage)
                alert(errorMessage)
            }
        },
        async getPair() {
            this.pair = ''
            const pair = await this.factoryContract.methods.getPair(
                this.getPairForm.tokenA, 
                this.getPairForm.tokenB)
            .call()
            this.pair = pair
        },
        async createPair() {

            try {

                this.createPairForm.transactionHash = ''

                const tx = this.factoryContract.methods.createPair(
                    this.createPairForm.tokenA, 
                    this.createPairForm.tokenB);
                const gas = await tx.estimateGas({from: this.account.address})

                const receipt = await this.factoryContract.methods.createPair(
                    this.createPairForm.tokenA, 
                    this.createPairForm.tokenB)
                .send({
                    from: this.account.address,
                    gas: gas,
                })
                this.createPairForm.transactionHash = receipt.transactionHash
                this.loadPairs()
                this.createPairForm.tokenA = ''
                this.createPairForm.tokenB = ''

            } catch (error) {
                const errorMessage = contractErrorExtract(error.message)
                console.log('createPair error', errorMessage)
                alert(errorMessage)
            }
        },
        selectPair(pair) {
            this.selectedPair = pair
        },
    },
    mounted() {
        this.loadFactoryContract()
    }
}
</script>