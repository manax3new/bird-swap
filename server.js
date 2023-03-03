const express = require('express')
const history = require('connect-history-api-fallback')
const config = require('./config/server')

const app = express()
app.use(history())
app.use(express.static('dist'))

app.listen(config.SERVER_PORT, function () {
    console.log('server start at', config.SERVER_PORT)
})