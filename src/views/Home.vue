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

	</div>
</template>
