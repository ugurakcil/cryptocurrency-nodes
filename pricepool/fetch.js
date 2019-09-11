'use strict'

const mongoose = require('mongoose')
const moment = require('moment')
const config = require('./config.js')
const connection = config.connection()

const MinOneForge = mongoose.model('minoneforge', config.schemas.minoneforge(), 'minoneforge')

/*connection.then(async () => {
  
})*/

const todayOneForge = async() => {
  let calculate = await calculateTodayOneForge()
  
  if(calculate){
    calculate = calculate[0]
    
    //console.log(JSON.stringify(calculate, null, 2))
  }
}

const calculateTodayOneForge = async() => {
  let t = config.helpers.createTime()
  
  let operations = [ { $match: { timestamp: { $gte: t.ago1day } } } ]
  let group = { '$group': { _id: null } }
  let project = { '$project': { } }
  
  for(let loop = 0; loop < config.symbols.oneforge.length; loop++){
    let currentSymbol = config.symbols.oneforge[loop]
    
    operations.push({ '$unwind':'$'+currentSymbol })

    group['$group'][currentSymbol+'firstPrice'] = { '$first': "$"+currentSymbol+".close" }
    group['$group'][currentSymbol+'lastPrice'] = { '$last': "$"+currentSymbol+".close" }
    group['$group'][currentSymbol+'high'] = { '$max': "$"+currentSymbol+".high" }
    group['$group'][currentSymbol+'low'] = { '$min': "$"+currentSymbol+".low" }

    project['$project'][currentSymbol] = {
        'change': { '$subtract': [ '$'+currentSymbol+'lastPrice', '$'+currentSymbol+'firstPrice' ] },
        'percentage': { '$subtract': [
            1, { '$divide': [ '$'+currentSymbol+'firstPrice', '$'+currentSymbol+'lastPrice' ] }
        ]},
        'open': '$'+currentSymbol+'firstPrice',
        'close': '$'+currentSymbol+'lastPrice',
        'high': '$'+currentSymbol+'high',
        'low': '$'+currentSymbol+'low'
    }
  }

  operations.push(group)
  operations.push(project)
  operations.push({ $sort: { timestamp: -1 } })

  return await MinOneForge.aggregate(operations,function(err, doc) {
    if (err) return console.error(err);

    if(doc && doc.length > 0) {
      return doc
    } else {
      return undefined
    }
  })
 }