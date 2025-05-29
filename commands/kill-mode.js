const KILLMODE = require('../KILLMODE')
module.exports = {
	name: 'kill-mode',
	description: 'kill-mode',
	slash: {
		name: 'kill-mode',
		description: 'kill-mode',
	},
	async executeSlash(interaction) {
		KILLMODE.set(!KILLMODE.get())
	},
	async execute(message,args) {
		KILLMODE.set(!KILLMODE.get())
	}
}
