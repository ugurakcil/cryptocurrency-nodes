'use strict'

const _ = require('lodash')
const axios = require('axios')
const moment = require('moment')
const mongoose = require('mongoose')
const config = require('./config.js')

const connection = config.connection()

const OneForge = mongoose.model('oneforge', config.schemas.oneforge(), 'oneforge')
const MinOneForge = mongoose.model('minoneforge', config.schemas.minoneforge(), 'minoneforge')

const now = Math.floor(Date.now() / 1000) // increased microseconds
const ago1min = Math.floor( now - (60 * 1) )
const ago1day = Math.floor( now - (60 * 60 * 24) ) // currenct hourly, change : 60 * 60 * 24

connection.then(() => {
    console.log('now:', moment.unix(now).format("MM/DD/YYYY hh:mm:ss"))
    console.log('ago1day:', moment.unix(ago1day).format("MM/DD/YYYY hh:mm:ss"))
    
    setInterval(saveOneForge, 5000)
})

const getOneForge = async () => {
    try {
        return await axios.get('https://forex.1forge.com/1.0.3/quotes?pairs=BTCUSD,BTCEUR,BTCJPY,BTCGBP,BTCTRY,ETHUSD,ETHEUR,ETHJPY,ETHGBP,ETHTRY,LTCUSD,LTCEUR,LTCJPY,LTCGBP,LTCTRY,XRPUSD,XRPEUR,XRPJPY,XRPGBP,XRPTRY,USDTRY,EURBTC,USDBTC,ETHBTC,LTCBTC,XRPBTC,TRYBTC,EURTRY,USDEUR,BCHTRY&api_key=HyWJyy31mercu9Hp6h18o3p0jxvznptq')
    } catch (error) {
        console.error(error)
    }
}

const saveOneForge = async() => {
    const oneForge = await getOneForge()

    var bulk = OneForge.collection.initializeOrderedBulkOp()
    
    for(let loop = 0; loop <= oneForge.data.length - 1; loop++){
        await bulk.insert(oneForge.data[loop])
    }
    
    await bulk.execute()
}

const saveMinOneForge = async() => {
    
}