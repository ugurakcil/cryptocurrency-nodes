#!/usr/bin/env node
const mongoose = require('mongoose');

module.exports =
{
    connection: () => 
    {
        mongoose.connect("mongodb://root:lion@localhost/pricepool?authSource=admin", {
            useNewUrlParser: true,
            useFindAndModify: false
        });
        const mongooseDb = mongoose.connection;
        mongooseDb.on('error', console.error.bind(console, 'connection error:'));
        mongooseDb.once('open', function() {
            console.log('Connected to MongoDB')
        });
        return mongooseDb
    },
    /*
    * Kayıt almasını istediğiniz sağlayıcıyı true olarak ayarlayın
    */
    providers: {
        oneforge: false,
        coincap: true
    },
    /*
    * İlgili API'dan çekilmesini istediğiniz coin datalarını yazın.
    * OneForge için Mongo Schema'lere ekleme yapmayı unutmayın.
    */
    symbols: {
        oneforge: ['BTCUSD','BTCEUR','BTCJPY', 'USDTRY'], 
        coincap: ['BTC']
    },
    schemas: {
        oneforge: () => {
            return new mongoose.Schema({
                timestamp: Number,
                BTCUSD: mongoose.Schema.Types.Decimal128,
                BTCEUR: mongoose.Schema.Types.Decimal128,
                BTCJPY: mongoose.Schema.Types.Decimal128,
                USDTRY: mongoose.Schema.Types.Decimal128
            })
        },
        minoneforge: () => {
            return new mongoose.Schema({
                timestamp: Number,
                BTCUSD: [new mongoose.Schema({
                    open: mongoose.Schema.Types.Decimal128,
                    low: mongoose.Schema.Types.Decimal128,
                    high: mongoose.Schema.Types.Decimal128,
                    close: mongoose.Schema.Types.Decimal128
                })],
                BTCEUR: [new mongoose.Schema({
                    open: mongoose.Schema.Types.Decimal128,
                    low: mongoose.Schema.Types.Decimal128,
                    high: mongoose.Schema.Types.Decimal128,
                    close: mongoose.Schema.Types.Decimal128
                })],
                BTCJPY: [new mongoose.Schema({
                    open: mongoose.Schema.Types.Decimal128,
                    low: mongoose.Schema.Types.Decimal128,
                    high: mongoose.Schema.Types.Decimal128,
                    close: mongoose.Schema.Types.Decimal128
                })],
                USDTRY: [new mongoose.Schema({
                    open: mongoose.Schema.Types.Decimal128,
                    low: mongoose.Schema.Types.Decimal128,
                    high: mongoose.Schema.Types.Decimal128,
                    close: mongoose.Schema.Types.Decimal128
                })]
            })
        },
        coincap: () => {
            return new mongoose.Schema({
                id: String,
                rank: Number,
                symbol: String,
                supply: mongoose.Schema.Types.Decimal128,
                maxSupply: mongoose.Schema.Types.Decimal128,
                marketCapUsd: mongoose.Schema.Types.Decimal128,
                volumeUsd24Hr: mongoose.Schema.Types.Decimal128,
                priceUsd: mongoose.Schema.Types.Decimal128,
                changePercent24Hr: mongoose.Schema.Types.Decimal128,
                vwap24Hr: mongoose.Schema.Types.Decimal128,
                timestamp: Number
            })
        },
        daycoincap: () => {
            return new mongoose.Schema({
                symbol: String,
                open: mongoose.Schema.Types.Decimal128,
                low: mongoose.Schema.Types.Decimal128,
                high: mongoose.Schema.Types.Decimal128,
                close: mongoose.Schema.Types.Decimal128,
                supply: mongoose.Schema.Types.Decimal128,
                maxSupply: mongoose.Schema.Types.Decimal128,
                marketCapUsd: mongoose.Schema.Types.Decimal128,
                volumeUsd24Hr: mongoose.Schema.Types.Decimal128,
                priceUsd: mongoose.Schema.Types.Decimal128,
                changePercent24Hr: mongoose.Schema.Types.Decimal128,
                vwap24Hr: mongoose.Schema.Types.Decimal128,
                timestamp: Number
            })
        }
    },
    helpers : {
        createTime: () => {
            let now = Math.floor( Date.now() / 1000 )
            
            return {
                'now': now,
                'lastMidnight' : Math.floor( new Date( new Date().setHours(0,0,0,0) ).getTime() / 1000 ),
                'ago1min' : Math.floor( now - (60 * 1) ),
                'ago1day' : Math.floor( now - (60 * 60 * 24) ), // 60 * 60 * 24
            }
        }
    }
};