<template>
    <div v-if="token" class="AddTokenButton">
        <el-button @click="add" type="primary" plain>Add {{token.symbol}} to Metamask</el-button>
    </div>
</template>
<script>
export default {
    props: [
        'token',
    ],
    setup(props) {

        const add = async () => {

            const token = props.token

            return await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: token.address,
                        symbol: token.symbol,
                        decimals: token.decimals,
                        image: (token.logoURI) ? token.logoURI : undefined,
                    },
                },
            })
        }

        return {
            add,
        }
    },
}
</script>