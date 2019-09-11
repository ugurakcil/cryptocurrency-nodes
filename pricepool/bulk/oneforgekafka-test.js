'use strict'

const axios = require('axios');
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
})

const getOneForge = async () => {
    try {
        return await axios.get('https://forex.1forge.com/1.0.3/quotes?pairs=BTCUSD,BTCEUR,BTCJPY,BTCGBP,BTCTRY,ETHUSD,ETHEUR,ETHJPY,ETHGBP,ETHTRY,LTCUSD,LTCEUR,LTCJPY,LTCGBP,LTCTRY,XRPUSD,XRPEUR,XRPJPY,XRPGBP,XRPTRY,USDTRY,EURBTC,USDBTC,ETHBTC,LTCBTC,XRPBTC,TRYBTC,EURTRY,USDEUR,BCHTRY&api_key=HyWJyy31mercu9Hp6h18o3p0jxvznptq')
    } catch (error) {
        console.error(error)
    }
}

const send2kafka = async () => {
    const oneForge = await getOneForge()

    if(oneForge){
        const producer = kafka.producer()
        await producer.connect()
        
        for(let loop = 0; loop <= oneForge.data.length - 1; loop++){
            console.log(
                loop,
                oneForge.data[loop].symbol,
                oneForge.data[loop].price,
                oneForge.data[loop].ask,
                oneForge.data[loop].bid,
                oneForge.data[loop].timestamp
            )
            
            await producer.send({
                topic: 'localkafka',
                messages: [
                    { value: JSON.stringify(oneForge.data[loop]) }
                ]
            })
        }
    }
}

setInterval(send2kafka, 5000)