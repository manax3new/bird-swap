const getPublicPath = () => {
    if(process.env.NODE_ENV === "production") {
        if(process.env.VUE_APP_DEPLOY_MODE === 'GITHUB') {
            return `/${process.env.VUE_APP_REPO_NAME}/`
        } else {
            return "/"
        }
    } else {
        return "/"
    }
}

module.exports = {
    publicPath: getPublicPath(),
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = "Bird swap";
                return args;
            })
    }
};