const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')

// ======== CONFIG ========
const CONFIG = {
	TARGET_GUILD_ID: '1254738977538310247',
	BOT_CHANNEL_ID: '1376299832934793277',
	KILL_MODE_FILE: path.join(__dirname, 'killmode.json')
}
// ========================

// Persistent kill mode state
const killMode = require('../KILLMODE')

module.exports = {
	name: 'guildMemberAdd',
	execute: async (bot, member) => {
		// Skip if not in target guild
		if (member.guild.id !== CONFIG.TARGET_GUILD_ID) return

		try {
			const shouldBan = killMode.get() || bot.autoKick.includes(member.id)
			if (!shouldBan) return

			const botChannel = await member.guild.channels.fetch(CONFIG.BOT_CHANNEL_ID).catch(() => null)

			try {
				await member.ban({ reason: 'Auto-banned: Restricted list' })

				console.log(`🔨 Banned ${member.user.tag} (${member.id})`)

				if (botChannel) {
					const embed = new Discord.EmbedBuilder()
						.setColor(0xff0000)
						.setTitle('⚡ Auto-Ban Executed')
						.setDescription(`${member.user.tag} was automatically banned`)
						.addFields(
							{ name: 'Mode', value: killMode.get() ? 'KILL MODE' : 'Standard', inline: true },
							{ name: 'Account Age', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
						)

					await botChannel.send({ embeds: [embed] }).catch(console.error)
				}
			} catch (banError) {
				console.error(`Ban failed for ${member.id}:`, banError)
				if (botChannel) {
					await botChannel.send(`❌ Failed to ban <@${member.id}>: ${banError.message}`).catch(console.error)
				}
			}
		} catch (error) {
			console.error('Auto-ban system error:', error)
			try {
				const errorChannel = await member.guild.channels.fetch(CONFIG.BOT_CHANNEL_ID).catch(() => null)
				if (errorChannel) {
					await errorChannel.send('⚠️ Auto-ban system malfunction').catch(console.error)
				}
			} catch (nestedError) {
				console.error('Failed to report error:', nestedError)
			}
		}
	},

	// Command to toggle kill mode
	async toggleKillMode(interaction) {
		const newState = !killMode.get()
		killMode.set(newState)

		await interaction
			.reply({
				embeds: [
					new Discord.EmbedBuilder()
						.setColor(newState ? 0xff0000 : 0x00ff00)
						.setTitle(`Kill Mode ${newState ? 'ACTIVATED' : 'DEACTIVATED'}`)
						.setDescription(`New members ${newState ? 'WILL' : 'will NOT'} be auto-banned`)
				],
				ephemeral: true
			})
			.catch(console.error)
	}
}
