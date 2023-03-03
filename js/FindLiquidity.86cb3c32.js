(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["FindLiquidity"],{"63c2":function(e,t,n){"use strict";n("7d84")},"7d84":function(e,t,n){},bf83:function(e,t,n){"use strict";n.r(t);var c=n("7a23"),a=function(e){return Object(c["pushScopeId"])("data-v-e014ea86"),e=e(),Object(c["popScopeId"])(),e},o={class:"Find"},r=a((function(){return Object(c["createElementVNode"])("h1",null,"Import Pool",-1)})),l=a((function(){return Object(c["createElementVNode"])("h3",null,"Import an existing pool",-1)})),i=a((function(){return Object(c["createElementVNode"])("div",{style:{"text-align":"center"}}," + ",-1)})),d=a((function(){return Object(c["createElementVNode"])("br",null,null,-1)})),u={key:0},b={key:1},k={key:0},s=a((function(){return Object(c["createElementVNode"])("br",null,null,-1)})),p=Object(c["createTextVNode"])("Manage this pool"),O={key:1},j=a((function(){return Object(c["createElementVNode"])("div",null," You don’t have liquidity in this pool yet. ",-1)})),f=a((function(){return Object(c["createElementVNode"])("br",null,null,-1)})),v=Object(c["createTextVNode"])("Add Liquidity");function m(e,t,n,a,m,h){var y=Object(c["resolveComponent"])("el-button"),B=Object(c["resolveComponent"])("router-link"),N=Object(c["resolveComponent"])("SelectTokenButton"),V=Object(c["resolveComponent"])("LiquidityCardPreview"),T=Object(c["resolveComponent"])("el-card");return Object(c["openBlock"])(),Object(c["createElementBlock"])("div",o,[Object(c["createVNode"])(T,null,{default:Object(c["withCtx"])((function(){return[Object(c["createVNode"])(B,{to:{name:"Liquidity"}},{default:Object(c["withCtx"])((function(){return[Object(c["createVNode"])(y,{icon:a.Back,circle:""},null,8,["icon"])]})),_:1}),r,l,Object(c["createElementVNode"])("div",null,[Object(c["createVNode"])(N,{onSelectToken:a.selectTokenAHandle,token:a.data.tokenA,pairToken:a.data.tokenB},null,8,["onSelectToken","token","pairToken"])]),i,Object(c["createElementVNode"])("div",null,[Object(c["createVNode"])(N,{onSelectToken:a.selectTokenBHandle,token:a.data.tokenB,pairToken:a.data.tokenA},null,8,["onSelectToken","token","pairToken"])]),d,Object(c["createElementVNode"])("div",null,["loading"===a.data.searchState?(Object(c["openBlock"])(),Object(c["createElementBlock"])("div",u," Loading... ")):"done"===a.data.searchState?(Object(c["openBlock"])(),Object(c["createElementBlock"])("div",b,[a.data.poolData?(Object(c["openBlock"])(),Object(c["createElementBlock"])("div",k,[Object(c["createVNode"])(V,{pair:a.data.poolData},null,8,["pair"]),s,Object(c["createElementVNode"])("div",null,[Object(c["createVNode"])(y,{onClick:a.addPair,type:"primary",plain:""},{default:Object(c["withCtx"])((function(){return[p]})),_:1},8,["onClick"])])])):(Object(c["openBlock"])(),Object(c["createElementBlock"])("div",O,[j,f,Object(c["createElementVNode"])("div",null,[Object(c["createVNode"])(y,{onClick:a.goAddLiquidity,type:"primary",plain:""},{default:Object(c["withCtx"])((function(){return[v]})),_:1},8,["onClick"])])]))])):Object(c["createCommentVNode"])("",!0)])]})),_:1})])}var h=n("c7eb"),y=n("1da1"),B=n("f6f2"),N=n("0759"),V=n("0b93"),T=n("4360"),E=n("c5a6"),C=n("5622"),w=n("2ffa"),x=n("6c02"),A=n("5d5c"),S=n("5fa6"),q={components:{SelectTokenButton:N["a"],LiquidityCardPreview:w["a"]},setup:function(){var e=Object(S["a"])(),t=e.chainId,n=Object(V["a"])(),a=Object(E["a"])(),o=Object(C["a"])(),r=Object(c["computed"])((function(){return T["a"].state.account})),l=Object(x["d"])(),i=Object(c["reactive"])({tokenA:null,tokenB:null,poolData:null,searchState:"idle"}),d=function(e){i.tokenA=e,b()},u=function(e){i.tokenB=e,b()},b=function(){var e=Object(y["a"])(Object(h["a"])().mark((function e(){var c,l,d,u,b,k;return Object(h["a"])().wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(i.tokenA&&i.tokenB){e.next=2;break}return e.abrupt("return");case 2:return c=Object(A["b"])(i.tokenA,t.value),l=Object(A["b"])(i.tokenB,t.value),i.searchState="loading",e.prev=5,d=n.toLiquidityToken(c,l),e.next=9,a.balanceOf(d.address,r.value.address);case 9:if(u=e.sent,!(parseInt(u)>0)){e.next=18;break}return b=n.createTokenAmount(d,u),e.next=14,o.getPair(c,l);case 14:k=e.sent[1],i.poolData={tokens:[c,l],liquidityToken:d,pairBalance:b,pairEntity:k},e.next=19;break;case 18:i.poolData=null;case 19:e.next=25;break;case 21:e.prev=21,e.t0=e["catch"](5),console.log("loadPoolData error",e.t0.message),i.poolData=null;case 25:i.searchState="done";case 26:case"end":return e.stop()}}),e,null,[[5,21]])})));return function(){return e.apply(this,arguments)}}(),k=function(){l.push({name:"AddLiquidity"})},s=function(){var e=Object(A["b"])(i.tokenA,t.value),n=Object(A["b"])(i.tokenB,t.value);T["a"].dispatch("addUserSavePairs",[e,n]),l.push({name:"Liquidity"})};return{Back:B["d"],data:i,selectTokenAHandle:d,selectTokenBHandle:u,goAddLiquidity:k,addPair:s}}},g=(n("63c2"),n("6b0d")),L=n.n(g);const P=L()(q,[["render",m],["__scopeId","data-v-e014ea86"]]);t["default"]=P}}]);
//# sourceMappingURL=FindLiquidity.86cb3c32.js.map