'use strict'

const mongoose = require('mongoose');
const moment = require('moment');
const config = require('./config.js');
const connection = config.connection();

const Daily = mongoose.model('test', config.schemas.test(), 'test')
const OneForge = mongoose.model('oneforge', config.schemas.test(), 'oneforge')

const nowTimestamp = Math.floor(Date.now() / 1000) // increased microseconds
const ago1day = Math.floor( nowTimestamp - (60 * 60 * 23.04) ) // currenct hourly, change : 60 * 60 * 24

connection.then(() => {
  console.log('now:', moment.unix(nowTimestamp).format("MM/DD/YYYY hh:mm:ss"))
  console.log('ago1day:', moment.unix(ago1day).format("MM/DD/YYYY hh:mm:ss"))

  // şu andan bir gün öncesinden daha yeni bir data var mı?
  Daily.findOne({created_at:{$gte:ago1day}}, (err, doc) => {
    if (err) return console.error(err);

    if(doc) {
      console.log('doc.price', parseFloat(doc.price))
    } else {
      console.log('current day record not found')
      createNewDay()
    }
  })
})

async function createNewDay() {
  const today = await calculateToday()

  if(today){
    console.log(today)
  }
}

async function calculateToday() {
  const operations = [
    { $match: { timestamp: { $gte: ago1day }, symbol: "BTCUSD" } },
    { $group: { 
      _id: null, 
      firstPrice: { $first: "$price" }, 
      lastPrice: { $last: "$price" },
      high: { $max: "$price" }, 
      low: { $min: "$price" } } 
    },
    {
      $project: {
        change: { $subtract: [ '$lastPrice', '$firstPrice' ] },
        percentage: { 
          $subtract: [
            1, { $divide: [ '$firstPrice', '$lastPrice' ] }
          ]
        },
        open: '$firstPrice',
        close: '$lastPrice',
        high: '$high',
        low: '$low'
      }
    },
    { $sort: { timestamp: -1 } }
  ]

  return await OneForge.aggregate(operations,function(err, doc) {
    if (err) return console.error(err);

    if(doc && doc.length > 0) {
      return doc
    } else {
      return undefined
    }
  })
}