import Web3 from 'web3'
import store from '@/store'
import { computed } from 'vue'
import { app } from '@/main'
import { getEnv } from '@/constant/config/Env'
import { ethers } from "ethers"

export default () => {

    const network = computed(() => {
        return store.state.network
    })
    const account = computed(() => {
        return store.state.account
    })
    const chainId = computed(() => {
        const { chainId: chainIdFromConfig } = getEnv()
        return network.value.id ? network.value.id : chainIdFromConfig
    })

    const getWeb3 = () => {
        return app.config.globalProperties.$web3
    }
    const getEthereum = () => {
        return app.config.globalProperties.$ethereum
    }
    const getNetwork = () => {
        return network.value
    }
    const getAccount = () => {
        return account.value
    }
    const getSigner = () => {
        return app.config.globalProperties.$etherSigner
    }

    const initWeb3 = async () => {

        if (window.ethereum) {

            app.config.globalProperties.$ethereum = window.ethereum
            app.config.globalProperties.$web3 = new Web3(window.ethereum)

            // await window.ethereum.enable()

            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            app.config.globalProperties.$etherSigner = signer

            window.ethereum.on('accountsChanged', () => {
                loadAppInfo()
            })

            window.ethereum.on('networkChanged', () => {
                loadAppInfo()
            })

        } else if (typeof window.web3 !== "undefined") {
            app.config.globalProperties.$web3 = new Web3(window.web3.currentProvider)
        } else {
            console.log("No web3? You should consider trying MetaMask!")
            app.config.globalProperties.$web3 = new Web3(
                new Web3.providers.HttpProvider("https://kovan.infura.io/")
            )
        }
    }

    const loadAppInfo = async () => {
        await loadAccount()
        await loadBalance()
        await loadNetwork()
    }

    const connectWallet = async () => {
        const ethereum = getEthereum()
        if (ethereum) {
            await ethereum.request({ method: "eth_requestAccounts" });
            await loadAccount()
            loadBalance()
        }
    }

    const loadNetwork = async () => {
        const web3 = getWeb3()
        const networkId = await web3.eth.net.getId();
        const networkMap = {
            1: "Mainnet",
            3: "Ropsten",
            4: "Rinkeby",
            5: "Goerli",
            42: "Kovan",
            56: 'BSC Mainnet',
            97: 'BSC Testnet',
        };
        store.commit('updateNetwork', {
            id: networkId,
            name: networkMap[networkId] || "Unknown",
        })
    }

    const loadAccount = async () => {
        const web3 = getWeb3()
        const accounts = await web3.eth.getAccounts();
        store.commit("updateAccountAddress", accounts[0]);
    }

    const loadBalance = async () => {
        let balance = 0
        const web3 = getWeb3()
        const account = getAccount()
        if(web3 && account.address) {
            balance = await web3.eth.getBalance(
                account.address
            )
        }
        store.commit("updateAccountBalance", balance);
    }

    return {
        initWeb3,
        loadAppInfo,
        loadBalance,
        connectWallet,
        getWeb3,
        getEthereum,
        getNetwork,
        getAccount,
        getSigner,
        account,
        network,
        chainId,
    }
}