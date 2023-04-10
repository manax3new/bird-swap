<template>
<div class="SelectTokenFragment">
    <div v-show="page === 'search'">
        <div>
            <el-input placeholder="Search name or paste address" v-model="data.keyword"></el-input>
        </div>
        <br>
        <div style="margin-bottom: 15px;">
            Common bases
            <el-tooltip
                effect="dark"
                content="These tokens are commonly paired with other tokens."
            >
                <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
        </div>
        <el-space wrap>
            <div>
                <el-button :disabled="isBNBNotAllow()" @click="selectToken(ETHER)"> 
                    <TokenIcon size="small" :token="ETHER"></TokenIcon>
                    &nbsp;
                    BNB
                </el-button>
            </div>
            <div v-for="(token, key) of baseTokens" :key="key">
                <el-button :disabled="isTokenNotAllow(token)" @click="selectToken(token)">
                    <TokenIcon size="small" :token="token"></TokenIcon>
                    &nbsp;
                    {{token.symbol}}
                </el-button>
            </div>
        </el-space>
        <el-divider />
        <div>
            <div v-show="isShowBNBInList">
                <div>
                    <TokenListItem :disabled="isBNBNotAllow()" @select="selectToken(ETHER)" :token="ETHER"></TokenListItem>
                </div>
            </div>
            <div v-for="token of tokensFilter" :key="token.address">
                <div>
                    <TokenListItem 
                    :disabled="isTokenNotAllow(token)" 
                    @select="selectToken(token)" 
                    @tokenImported="loadTokens()"
                    :token="token"></TokenListItem>
                </div>
            </div>
        </div>
        <br/>
        <br/>
        <div class="flex-center">
            <el-button @click="goManageToken" type="primary" link>Manage Tokens</el-button>
        </div>
    </div>
    <div v-show="page === 'manage'">
        <el-input placeholder="0x0000" v-model="data.keyword"></el-input>
        <br/>
        <br/>
        <div v-for="token of tokensUserAddedFilter" :key="token.address">
            <div>
                <TokenListItem 
                :token="token"
                @tokenImportedRemoved="loadTokens()"
                :pageMode="page"></TokenListItem>
            </div>
        </div>
        <br/>
        <div class="flex justify-content-space-between align-items-center" style="padding-left: 10px;">
            <div>
                {{ tokensUserAddedFilter.length }} Custom Token
            </div>
            <div>
                <el-button @click="clearAllUserAddedToken" type="primary">Clear all</el-button>
            </div>
        </div>
    </div>
</div>
</template>
<script>

import { QuestionFilled } from '@element-plus/icons-vue'
import { ETHER } from '@pancakeswap/sdk'
import { getPrimaryTokens, getUserAddedTokens } from '@/use/TokenList'
import { onMounted, reactive, toRaw, computed, watch } from 'vue'
import TokenListItem from '@/components/TokenListItem'
import TokenIcon from '@/components/TokenIcon'
import { getConstantTokens } from '@/constant/config/tokens'
import { ChainId } from '@pancakeswap/sdk'
import useWeb3Connect from '@/use/Web3Connect'
import { isAddress } from '@/utils'
import { fetchTokenFromChain } from '@/use/Tokens'
import store from '@/store'

export default {
    props: [
        'pairToken',
        'page',
    ],
    components: {
        QuestionFilled,
        TokenListItem,
        TokenIcon,
    },
    setup(props, context) {

        const Web3Connect = useWeb3Connect()
        const chainId = Web3Connect.chainId

        const TOKENS = getConstantTokens()
        
        const BASE_TOKENS = {
            [ChainId.MAINNET]: [
                TOKENS.busd,
                TOKENS.cake,
                TOKENS.btcb,
            ],
            [ChainId.TESTNET]: [
                TOKENS.wbnb,
                TOKENS.cake,
                TOKENS.busd,
            ],
        }

        const baseTokens = BASE_TOKENS[chainId.value]
        
        const data = reactive({
            tokens: [],
            keyword: '',
            tokensFromChain: null,
            page: 'search', //search, manage
        })

        const selectToken = (token) => {
            context.emit('selectToken', token)
        }

        const isBNBNotAllow = () => {
            if(!props.pairToken) {
                return false
            }
            return toRaw(props.pairToken) === ETHER
        }

        const isTokenNotAllow = (token) => {
            if(!props.pairToken) {
                return false
            }
            return props.pairToken.address === token.address
        }

        const tokensFilter = computed(() => {

            let tokens = []

            if(!data.keyword) {
                return data.tokens
            }
            tokens = data.tokens.filter((token) => {
                const isSymbolContain = token.symbol.toLowerCase().includes(data.keyword.toLowerCase())
                const isAddressMatch = token.address.toString() === data.keyword.toString() 
                return isSymbolContain || isAddressMatch
            })
            if(tokens.length > 0) {
                return tokens
            }
            if(data.tokensFromChain) {
                tokens = [ data.tokensFromChain ]
            }

            return tokens
        })

        const tokensUserAddedFilter = computed(() => {
            return tokensFilter.value.filter((token) => {
                return token.isAddedByUser
            })
        })

        const isShowBNBInList = computed(() => {
            const name = 'BNB'
            return name.toLowerCase().includes(data.keyword.toLowerCase())
        })

        watch(() => data.keyword, async (newVal) => {
            if(isAddress(newVal)) {
                const tokensFromChain = await fetchTokenFromChain(data.keyword)
                if(!tokensFromChain) {
                    return
                }
                const isTokenAlreadyInPrimaryToken = data.tokens.find((primaryToken) => {
                    return primaryToken.address.toLowerCase() === tokensFromChain.address.toLowerCase()
                })
                data.tokensFromChain = {
                    ...tokensFromChain,
                    isAdded: !!isTokenAlreadyInPrimaryToken,
                }
            }
        })

        const loadTokens = async () => {

            let tokens = await getPrimaryTokens()
            let userAddedTokens = await getUserAddedTokens()

            userAddedTokens = userAddedTokens.map((userAddedToken) => {
                const tokenWithInfo = userAddedToken
                tokenWithInfo.isAddedByUser = true
                return tokenWithInfo
            }
            )
            tokens = tokens.concat(userAddedTokens)

            tokens = tokens.map((token) => {
                const tokenWithInfo = token
                tokenWithInfo.isAdded = true
                return tokenWithInfo
            })
            data.tokens = tokens
        }

        const goManageToken = () => {
            context.emit('pageChanged', 'manage')
        }

        const goSearchToken = () => {
            context.emit('pageChanged', 'search')
        }

        const clearAllUserAddedToken = () => {
            store.dispatch('clearAllUserAddedTokens')
            loadTokens()
        }

        onMounted(() => {
            loadTokens()
        })

        return {
            ETHER,
            baseTokens,
            selectToken,
            data,
            isBNBNotAllow,
            isTokenNotAllow,
            tokensFilter,
            isShowBNBInList,
            loadTokens,
            goManageToken,
            goSearchToken,
            tokensUserAddedFilter,
            clearAllUserAddedToken,
        }
    },
}
</script>