<template>
<div v-if="token" @click="select" class="TokenListItem" :class="{'disabled': disabled}">
    <div style="display: flex; align-items: center;">
        <div style="padding: 4px; margin-right: 5px;">
            <TokenIcon size="medium" :token="token"></TokenIcon>
        </div>
        <div v-if="token === ETHER">
            <div>
               <strong>BNB</strong>
            </div>
            <div>
                BNB
            </div>
        </div>
        <div v-else>
            <div>
                <strong>{{token.symbol}}</strong>
            </div>
            <div class="flex">
                <div v-if="token.isAddedByUser && pageMode !== 'manage'">
                    Added by user • &nbsp;
                </div>
                <div>
                    {{token.name}}
                </div>
            </div>
        </div>
    </div>
    <div>
        <div v-if="pageMode === 'manage'" class="flex align-items-center">
            <el-button @click="removeImportToken" link :icon="Close"></el-button>
            <div class="horizontal-space-5"></div>
            <el-link type="primary" :href="viewAddressOnBscUrl(token.address)" target="_blank">
                <el-icon><Link /></el-icon>
            </el-link>
        </div>
        <div v-else>
            <div v-if="token === ETHER">
                {{bnbBalanceFormat(bnbBalance, 4)}}
            </div>
            <div v-else-if="!token.isAdded">
                <el-button @click="toImportToken" type="primary">Import</el-button>
            </div>
            <div v-else-if="balance">
                {{balance.toSignificant(4)}}
            </div>
            <div v-else>
                0
            </div>
        </div>
    </div>

    <el-dialog
        v-model="importTokenState.dialogVisible"
        title="Import Tokens"
        width="50%"
    >
        <div>
            <el-card>
                Anyone can create a BEP20 token on BSC with any name, including creating fake versions of existing tokens and tokens that claim to represent projects that do not have a token.
                <br/>
                <br/>
                If you purchase an arbitrary token, you may be unable to sell it back.
            </el-card>
            <br/>
            <div>
                {{ token.name }}&nbsp;({{ token.symbol }})
            </div>
            <div class="vertical-space-10"></div>
            <div class="flex justify-content-space-between">
                <div>
                    {{ truncateHash(token.address) }}
                </div>
                <div>
                    <el-link type="primary" :href="viewAddressOnBscUrl(token.address)" target="_blank">(View on BscScan)</el-link>
                </div>
            </div>
            <br/>
            <div class="flex justify-content-space-between">
                <div>
                    <el-checkbox v-model="importTokenState.isUnderstand" label="I understand" size="large" />
                </div>
                <div>
                    <el-button @click="importToken" :disabled="!importTokenState.isUnderstand" type="primary">Import</el-button>
                </div>
            </div>
        </div>
    </el-dialog>
</div>
</template>
<script>

import {ETHER} from '@pancakeswap/sdk'
import TokenIcon from '@/components/TokenIcon'
import useERC20 from '@/use/ERC20.js'
import store from '@/store'
import useParseSdkEntity from '@/use/ParseSdkEntity'
import { ref, onMounted, reactive } from 'vue'
import { bnbBalanceFormat, viewAddressOnBscUrl } from '@/lib/utils.js'
import truncateHash from '@/utils/truncateHash'
import { Close, Link } from '@element-plus/icons-vue'

export default {
    props: [
        'token',
        'disabled',
        'pageMode',
    ],
    components: {
        TokenIcon,
        Link,
    },
    setup(props, context) {

        const ERC20 = useERC20()
        const ParseSdkEntity = useParseSdkEntity()
        const balance = ref(null)
        const bnbBalance = store.state.account.balance
        const importTokenState = reactive({
            dialogVisible: false,
            isUnderstand: false,
        })

        const select = () => {
            if(props.disabled || (!props.token.isAdded && props.token.symbol !== 'BNB')) {
                return
            }
            context.emit('select', props.token)
        }

        const loadBalance = async () => {
            const rawBalance = await ERC20.balanceOf(props.token.address, store.state.account.address)
            balance.value = ParseSdkEntity.createTokenAmount(props.token, rawBalance)
        }

        const toImportToken = () => {
            importTokenState.dialogVisible = true
        }

        const importToken = () => {
            store.dispatch('addUserAddedTokens', props.token)
            importTokenState.dialogVisible = false
            context.emit('tokenImported')
        }

        const removeImportToken = () => {
            store.dispatch('removeUserAddedTokens', props.token)
            context.emit('tokenImportedRemoved')
        }

        onMounted(() => {
            loadBalance()
        })
        
        return {
            ETHER,
            select,
            balance,
            bnbBalance,
            bnbBalanceFormat,
            toImportToken,
            importTokenState,
            importToken,
            truncateHash,
            viewAddressOnBscUrl,
            Close,
            removeImportToken,
        }
    },
}
</script>
<style scoped>
.TokenListItem {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    cursor: pointer;
}

.TokenListItem.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>