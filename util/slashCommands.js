const fs = require('fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
require('dotenv').config()
// Require SlashCommandBuilder
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	init: async (Client) => {
		const rest = new REST({ version: '9' }).setToken(process.env.TOKEN)
		const commandFiles = fs.readdirSync('./commands/').filter((file) => file.endsWith('.js'))
		let commands = []
		for (const file of commandFiles) {
			const command = require(`../commands/${file}`)
			if (command.slash) {
				commands.push(command.slash)
				Client.slashCommands.set(command.slash.name, command)
			} else {
				continue
			}
		}
		try {
			await rest.put(Routes.applicationCommands(process.env.ID), { body: commands })
		} catch (error) {
			console.error('Could not register slash commands')
		}
	}
}
