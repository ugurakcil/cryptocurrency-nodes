'use strict'

const axios = require('axios')
const moment = require('moment')
const mongoose = require('mongoose')
const config = require('./config.js')

const connection = config.connection()

const CoinCap = (config.providers.coincap === true) ? mongoose.model('coincap', config.schemas.coincap(), 'coincap') : false
const DailyCoinCap = (config.providers.coincap === true) ? mongoose.model('daycoincap', config.schemas.daycoincap(), 'daycoincap') : false
const OneForge = (config.providers.oneforge === true) ? mongoose.model('oneforge', config.schemas.oneforge(), 'oneforge') : false
const MinOneForge = (config.providers.oneforge === true) ? mongoose.model('minoneforge', config.schemas.minoneforge(), 'minoneforge') : false

/*
* Zaman aralıklarını (setinterval sürelerini) ayarlarken kolleksiyonlarda
* geçmiş veri kayıtlarıyla uyumsuzluk olmadığına dikkat edin.
*/
connection.then(() => {
    if(OneForge !== false)
        setInterval(saveOneForge, 10000) // 1-5-10 sn olarak ayarlanabilir
    
    if(CoinCap !== false)
        setInterval(saveCoinCap, 1000 * 60 * 15) // 15 dk olarak ayarlandı / 1000 * 60 * 15
})

const getOneForge = async () => {
    try {
        return await axios.get('https://forex.1forge.com/1.0.3/quotes?pairs=BTCUSD,BTCEUR,BTCJPY,BTCGBP,BTCTRY,ETHUSD,ETHEUR,ETHJPY,ETHGBP,ETHTRY,LTCUSD,LTCEUR,LTCJPY,LTCGBP,LTCTRY,XRPUSD,XRPEUR,XRPJPY,XRPGBP,XRPTRY,USDTRY,EURBTC,USDBTC,ETHBTC,LTCBTC,XRPBTC,TRYBTC,EURTRY,USDEUR,BCHTRY&api_key=HyWJyy31mercu9Hp6h18o3p0jxvznptq')
    } catch (error) {
        console.error(error)
    }
}

const getCoinCap = async () => {
    try {
        return await axios.get('https://api.coincap.io/v2/assets')
    } catch (error) {
        console.error(error)
    }
}

const saveCoinCap = async() => {
    const coinCap = await getCoinCap()
    const newTime = config.helpers.createTime()

    let bulk = CoinCap.collection.initializeOrderedBulkOp()

    if(coinCap) {
        for(let loop = 0; loop < coinCap.data.data.length; loop++) {
            let coinCapRow = coinCap.data.data[loop]

            coinCapRow = {
                id : coinCapRow.id,
                rank: coinCapRow.rank,
                symbol: coinCapRow.symbol,
                name: coinCapRow.name,
                supply: parseFloat(coinCapRow.supply),
                maxSupply: parseFloat(coinCapRow.maxSupply),
                volumeUsd24Hr: parseFloat(coinCapRow.volumeUsd24Hr),
                priceUsd: parseFloat(coinCapRow.priceUsd),
                changePercent24Hr: parseFloat(coinCapRow.changePercent24Hr),
                vwap24Hr: parseFloat(coinCapRow.vwap24Hr),
                timestamp: newTime.now
            }

            if(config.symbols.coincap.indexOf(coinCapRow.symbol) <= -1) {
                continue
            }

            await bulk.insert(coinCapRow)
    
            await saveTodayCoinCap(coinCapRow, newTime)
        }
    }
    
    await bulk.execute()

    let deleteTimeRange = parseInt(moment(newTime.now*1000).format('hhmm'))

    /*
    00:00 ile 00:05 arasında data silme işlemi başlatır
    30 günden öncesini sil isteği gönderir
    */
    if(deleteTimeRange < 5 && deleteTimeRange > 0) {
        await CoinCap.deleteMany({ timestamp: { $lt: ago1month } })
        //console.log('COINCAP : 30 gün öncesindeki veriler silindi.')
    }
}

const saveTodayCoinCap = async(docData, newTime) => {
    let lastMidnight = newTime.lastMidnight

    const getLastDailyCoinCap = await DailyCoinCap.findOne({ 'timestamp' : {'$gte' : lastMidnight} })

    if(getLastDailyCoinCap){
        if(getLastDailyCoinCap.volumeUsd24Hr < docData.volumeUsd24Hr){
            await DailyCoinCap.findOneAndUpdate({_id:getLastDailyCoinCap._id}, {
                symbol: docData.symbol,
                open: parseFloat(getLastDailyCoinCap.open),
                low: parseFloat(docData.priceUsd) < parseFloat(getLastDailyCoinCap.low) ? parseFloat(docData.priceUsd) : parseFloat(getLastDailyCoinCap.low),
                high: parseFloat(docData.priceUsd) > parseFloat(getLastDailyCoinCap.high) ? parseFloat(docData.priceUsd) : parseFloat(getLastDailyCoinCap.high),
                close: docData.priceUsd,
                volume: docData.volumeUsd24Hr,
                supply: parseFloat(docData.supply),
                maxSupply: parseFloat(docData.maxSupply),
                volumeUsd24Hr: parseFloat(docData.volumeUsd24Hr),
                priceUsd: parseFloat(docData.priceUsd),
                changePercent24Hr: parseFloat(docData.changePercent24Hr),
                vwap24Hr: parseFloat(docData.vwap24Hr)
            })
        }
    } else {
        await new DailyCoinCap({
            symbol: docData.symbol,
            open: docData.priceUsd,
            low: docData.priceUsd,
            high: docData.priceUsd,
            close: docData.priceUsd,
            volume: docData.volumeUsd24Hr,
            supply: (docData.supply) ? parseFloat(docData.supply) : null,
            maxSupply: (docData.maxSupply) ? parseFloat(docData.maxSupply) : null,
            volumeUsd24Hr: parseFloat(docData.volumeUsd24Hr),
            priceUsd: parseFloat(docData.priceUsd),
            changePercent24Hr: parseFloat(docData.changePercent24Hr),
            vwap24Hr: parseFloat(docData.vwap24Hr),
            timestamp: docData.timestamp
        }).save()
    }
    
}

const saveOneForge = async() => {
    const oneForge = await getOneForge()
    const newTime = config.helpers.createTime()
    
    let generateDocData = {
        timestamp: newTime.now
    }

    await oneForge.data.forEach(oneForgeRow => {
        if(config.symbols.oneforge.indexOf(oneForgeRow.symbol) > -1){
            generateDocData[oneForgeRow.symbol] = oneForgeRow.price
        }
    })

    await new OneForge(generateDocData).save()
    
    await saveMinOneForge(generateDocData, newTime)
}

const saveMinOneForge = async(docData, newTime) => {
    let generateMinDocData = {},
        now = newTime.now,
        ago1min = newTime.ago1min,
        ago1day = newTime.ago1day
    
    const getLastMinOneForge = await MinOneForge.findOne({ 'timestamp' : {'$gte' : ago1min} })

    if(getLastMinOneForge) {
        for(let loop = 0; loop < config.symbols.oneforge.length; loop++){
            let currentSymbol = config.symbols.oneforge[loop]
            
            generateMinDocData[currentSymbol] = {
                open: parseFloat(getLastMinOneForge[currentSymbol][0].open),
                low: parseFloat(docData[currentSymbol]) < parseFloat(getLastMinOneForge[currentSymbol][0].low) ? parseFloat(docData[currentSymbol]) : parseFloat(getLastMinOneForge[currentSymbol][0].low),
                high: parseFloat(docData[currentSymbol]) > parseFloat(getLastMinOneForge[currentSymbol][0].high) ? parseFloat(docData[currentSymbol]) : parseFloat(getLastMinOneForge[currentSymbol][0].high),
                close: docData[currentSymbol]
            }
        }

        await MinOneForge.findOneAndUpdate({_id:getLastMinOneForge._id}, generateMinDocData)
        //console.log('dakika mevcut. güncellenecek. : ', moment(Math.floor(docData.timestamp * 1000)).format('DD/MM/YYYY hh:mm:ss'))
    } else {
        generateMinDocData.timestamp = docData.timestamp
        
        for(let loop = 0; loop < config.symbols.oneforge.length; loop++){
            let currentSymbol = config.symbols.oneforge[loop]

            generateMinDocData[currentSymbol] = {
                open: docData[currentSymbol],
                low: docData[currentSymbol],
                high: docData[currentSymbol],
                close: docData[currentSymbol]
            }
        }

        await new MinOneForge(generateMinDocData).save()
        //console.log('Dakika doldu. Yeni dakika satırı oluşturulacak. : ', moment(Math.floor(docData.timestamp * 1000)).format('DD/MM/YYYY hh:mm:ss'))
    }

    //console.log(JSON.stringify(generateMinDocData, null, 2))
}