const fs = require('fs')
const Discord = require('discord.js')
const { getFiles } = require('../util/functions')

module.exports = (bot, reload) => {
	const { Client } = bot
	const events = getFiles('./events/', '.js')
	if (events.length === 0) return console.warn('No events found')
	for (const event of events) {
		if (reload) {
			delete require.cache[`../events/${event}`]
			bot.Client.removeAllListeners('ready')
			bot.Client.removeAllListeners('messageCreate')
			bot.Client.removeAllListeners('interactionCreate')
			bot.Client.removeAllListeners('guildMemberAdd')
		}
		const eventFile = require(`../events/${event}`)
		const eventName = event.split('.')[0]
		Client.events.set(eventName, eventFile)
	}
	initEvents(bot)
}
function triggerEvent(bot, eventName, ...args) {
	const { Client } = bot
	try {
		if (Client.events.has(eventName)) {
			var code = Client.events.get(eventName).execute
			code(bot, ...args)
		} else {
			throw new Error(`Event ${eventName} not found`)
		}
	} catch (err) {
		console.error(err)
	}
}
function initEvents(bot) {
	bot.Client.once('ready', () => {
		triggerEvent(bot, 'ready')
	})
	bot.Client.on('messageCreate', (message) => {
		triggerEvent(bot, 'messageCreate', message)
	})
	bot.Client.on('interactionCreate', (interaction) => {
		triggerEvent(bot, 'interactionCreate', interaction)
	})
	bot.Client.on('guildMemberAdd', (member) => {
		triggerEvent(bot, 'guildMemberAdd', member)
	})
}
