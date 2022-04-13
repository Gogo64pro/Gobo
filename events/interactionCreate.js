module.exports = {
    name: 'interactionCreate',
        execute: (bot, interaction) => {
            const {Client} = bot
            if(!interaction.isCommand()) return;
            if(!Client.slashCommands.has(interaction.commandName)) return;
            Client.slashCommands.get(interaction.commandName).executeSlash(interaction)
        }
}