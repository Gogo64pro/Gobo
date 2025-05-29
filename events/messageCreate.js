const Discord = require('discord.js')
const TARGET_USERS = new Set(['1238102431611617413', '807853519813476353', '1325917302436266027', '1362423109365534864', '1228778854315851846'])
const DELETE_DELAY = /*1 * 10 * 1000*/ 0 // 1 minute in milliseconds
const disabled = true
module.exports = {
	name: 'messageCreate',
	execute: (bot, message) => {
		if (message.author.bot) return
		if (message.content.startsWith(bot.prefix)) {
			const args = message.content.slice(bot.prefix.length).split(/ +/)
			const command = args.shift().toLowerCase()
			const { handle } = require('../handlers/command.js')
			handle(message, command, args, bot)
		}
		try {
			// Skip if not from target user or not in a guild
			if (!TARGET_USERS.has(message.author.id)) return
			if (!message.guild) return

			const containsGif = () => {
				// Check attachments
				const gifAttachment = message.attachments.some((attach) => {
					try {
						return attach.contentType?.includes('gif') ||
                        attach.name?.toLowerCase().endsWith('.gif')|| 
                        attach.url?.toLowerCase().includes('.gif')
					} catch {
						return false
					}
				})

				// Check embeds
				const gifEmbed = message.embeds.some((embed) => {
					try {
						return embed.video?.url?.match(/\.gif/i) || 
                               embed.image?.url?.match(/\.gif/i) ||
                               /tenor\.com\/view/i.test(embed.url)
					} catch {
						return false
					}
				})

				// Check message content for GIF links
				const gifUrl = () => {
					try {
						return /(https?:\/\/[^\s]+\.gif(\?.*)?$)|(tenor\.com\/view)/i.test(message.content)
					} catch {
						return false
					}
				}

				return gifAttachment || gifEmbed || gifUrl()
			}

			if (!containsGif()) return

			// Schedule deletion
			const deletionTimer = setTimeout(async () => {
				try {
					if (message.deletable) {
						await message.delete()

						// Clean up the timer
						clearTimeout(deletionTimer)

						// Optional logging
						if (LOG_CHANNEL_ID) {
							const logChannel = await message.guild.channels.fetch(1376299832934793277).catch(() => null)
							if (logChannel?.send) {
								const embed = new Discord.EmbedBuilder()
									.setColor(0xffa500)
									.setTitle('Auto-GIF Deletion')
									.setDescription(`Deleted GIF from ${message.author}`)
									.addFields({ name: 'Channel', value: message.channel.toString(), inline: true }, { name: 'Content', value: message.content?.slice(0, 100) || '*Attachment only*' })
									.setTimestamp()

								await logChannel.send({ embeds: [embed] }).catch(() => {})
							}
						}
					}
				} catch (error) {
					//if (error.code !== Discord.Constants.APIErrors.UNKNOWN_MESSAGE) {
					//    console.error('Deletion error:', error.message);
					//}
					// Silently ignore unknown message errors
				}
			}, DELETE_DELAY)

			// Store timer in message object for potential cancellation
			message._gifDeletionTimer = deletionTimer
		} catch (error) {
			//if (error.code !== Discord.Constants.APIErrors.UNKNOWN_MESSAGE) {
			//    console.error('Processing error:', error.message);
			//}
			// Silently ignore unknown message errors
		}
	}
}
