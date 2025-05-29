module.exports = {
	name: 'test-bot',
	description: 'Test if the bot is working',
	slash: {
		name: 'test-bot',
		description: 'Test if the bot is working'
	},
	execute(message, args) {
		message.channel.send("Gosho bota raboti, @GOT_PRO-BG go krusti")
	},
	executeSlash: async (interaction) => {
		interaction.reply("Gosho bota raboti, @GOT_PRO-BG go krusti")
	}
}
