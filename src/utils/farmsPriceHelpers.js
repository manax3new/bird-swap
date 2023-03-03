export const filterFarmsByQuoteToken = (farms, preferredQuoteTokens = ['BUSD', 'WBNB']) => {
    const preferredFarm = farms.find((farm) => {
        return preferredQuoteTokens.some((quoteToken) => {
            return farm.quoteToken.symbol === quoteToken
        })
    })
    return preferredFarm || farms[0]
}
  
export default filterFarmsByQuoteToken