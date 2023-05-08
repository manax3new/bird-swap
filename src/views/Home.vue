<template>
    <div class="home">
        <div class="box-wrapper">
            <div class="bg-home"><img src="/images/36136.png"></div>
            <h1>Trade crypto and NFTs<br> with confidence</h1>
            <div class="text_small">Buy, sell, and explore tokens and NFTs</div>
            <div style="margin-top: 25px;">
                <el-button
                        class="bt-lg"
                        type="primary"
                        :disabled="onSwap || isNeedPriceUpdatedAccept"
                        @click="swap">Get Started
                </el-button>
            </div>
        </div>

        <div class="box-container">
            <el-row :gutter="20">
            <el-col :span="12">
                <div class="el-card is-always-shadow">
                    <div class="el-card__body">
                        <div><h2>Swap Token</h2></div>
                        <div>
                          <span style="font-size: 18px;">Buy, sell, and explore tokens on Ethereum, Polygon, Optimism, and more.</span>
                        </div>
                        <div>Trade Tokens</div>
                    </div>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="el-card is-always-shadow">
                    <div class="el-card__body">
                        <div><h2>Trade NFTs</h2></div>
                        <div>
                            <span style="font-size: 18px;">Buy and sell NFTs across marketplaces to find more listings at better prices.</span>
                        </div>
                        <div>Explore NFTs</div>
                    </div>
                </div>
            </el-col>
            </el-row>
        </div>

    </div>
</template>
