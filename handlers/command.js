const fs = require('fs')
const Discord = require('discord.js')

module.exports = {
	init: (Client, reload) => {
		const commandFiles = fs.readdirSync(`${process.cwd()}/commands`).filter((file) => file.endsWith('.js'))

		for (const file of commandFiles) {
			if (reload) {
				delete require.cache[`${process.cwd()}/commands/${file}`]
			}
			const command = require(`${process.cwd()}/commands/${file}`)
            if(command.disabled) continue
			if (command.name) {
				Client.commands.set(command.name, command)
			} else {
				continue
			}
		}
		Client.commandFiles = commandFiles
	},
	handle: (message, command, args, bot) => {
		const { Client } = bot
		for (const commandFile of Client.commandFiles) {
			if (commandFile === `${command}.js` || Client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(command))) {
				;(Client.commands.get(command) || Client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(command))).execute(message, args, command, bot)
				return
			}
		}
		message.reply('Command not found')
	}
}
