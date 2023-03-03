import sample from 'lodash/sample'

// export const nodes = [process.env.VUE_APP_PUBLIC_NODE_1, process.env.VUE_APP_PUBLIC_NODE_2, process.env.VUE_APP_PUBLIC_NODE_3]
export const nodes = [process.env.VUE_APP_PUBLIC_NODE_3]

const getNodeUrl = () => {
    // Use custom node if available (both for development and production)
    // However on the testnet it wouldn't work, so if on testnet - comment out the NEXT_PUBLIC_NODE_PRODUCTION from env file
    if (process.env.VUE_APP_PUBLIC_NODE_PRODUCTION) {
      return process.env.VUE_APP_PUBLIC_NODE_PRODUCTION
    }
    return sample(nodes)
}
  
export default getNodeUrl