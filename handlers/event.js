const fs = require('fs')
const Discord = require('discord.js')
const {getFiles} = require('../util/functions')

module.exports= (bot, reload) => {
    const {Client} = bot
    const events = getFiles('./events/', '.js')
    if(events.length === 0) return console.warn('No events found')
    for(const event of events){
        if(reload) 
            delete require.cache[require.resolve(`../events/${event}`)]
        const eventFile = require(`../events/${event}`)
        const eventName = event.split('.')[0]
        Client.events.set(eventName, eventFile)
    }
    initEvents(bot)
}
function triggerEvent(bot, eventName, ...args){
    const {Client} = bot
    try{
        if(Client.events.has(eventName)){
            Client.events.get(eventName).execute(bot, ...args)
        }else{
            throw new Error(`Event ${eventName} not found`)
        }
    }catch(err){
        console.error(err)
    }
}

function initEvents(bot){
    bot.Client.once('ready', () => {
        triggerEvent(bot, 'ready')
    })
    bot.Client.on('message', message => {
        triggerEvent(bot, 'message', message)
    })
    bot.Client.on('interactionCreate', interaction => {
       triggerEvent(bot, 'interactionCreate', interaction)
    });
}
