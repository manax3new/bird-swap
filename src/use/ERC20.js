import ERC20ABI from '@/constant/abi/ERC20.json'
import useWeb3Connect from '@/use/Web3Connect'

export default (context) => {

    const Web3Connect = useWeb3Connect()
    const web3 = Web3Connect.getWeb3()

    const tokensMap = {}

    const getTokenContract = async (address) => {
    
        if(tokensMap[address]) {
            return tokensMap[address]
        }

        const contract = new web3.eth.Contract(ERC20ABI, address)
        tokensMap[address] = contract

        return contract
    }
    
    const balanceOf = async (tokenAddress, accountAddress) => {
        if(!tokenAddress || !accountAddress){
            return 0
        }
        try {

            const contract = await getTokenContract(tokenAddress)
            return await contract.methods.balanceOf(accountAddress).call()

        } catch (error) {
            // console.log(`ERC20.balanceOf ${tokenAddress} error`, error.message)
            return 0
        }
    }

    const totalSupply = async (tokenAddress) => {
        if(!tokenAddress){
            return 0
        }
        try {
            const contract = await getTokenContract(tokenAddress)
            return await contract.methods.totalSupply().call()
        } catch (error) {
            console.log('ERC20.totalSupply error', error.message)
            return 0
        }
    }

    const allowance = async (tokenAddress, ownerAddress, spenderAddress) => {
        if(!ownerAddress || !spenderAddress) {
            return 0
        }
        const contract = await getTokenContract(tokenAddress)
        return await contract.methods.allowance(ownerAddress, spenderAddress).call()
    }

    return {
        getTokenContract,
        balanceOf,
        totalSupply,
        allowance,
        context,
    }
}