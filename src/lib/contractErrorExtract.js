export default (raw) => {
    try {
        const jsonStr = raw.substr(raw.indexOf('{'))
        const json = JSON.parse(jsonStr)
        return json.message
    } catch (error) {
        console.log('contractErrorExtract fail', error.message)
        return raw
    }
}

export const callWithGasPriceErrorExtract = (raw) => {
    try {
        const lastIndex = raw.indexOf('(action=')
        const str = raw.substring(0, lastIndex)
        if(str.length && str.length > 0) {
            return str
        } else {
            return 'Please try again. Confirm the transaction and make sure you are paying enough gas!'
        }
    } catch (error) {
        return 'Please try again. Confirm the transaction and make sure you are paying enough gas!'
    }
}