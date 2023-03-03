const axios = require('axios')

module.exports = (options) => {

    return new Promise((resolve) => {
        axios(options)
        .then(function (response) {
            resolve(response);
        })
        .catch(function (error) {
            if(error.response){
                resolve(error.response);
            }else{
                resolve(error)
            }
        })
    })    
}