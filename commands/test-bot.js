module.exports =  {
    name: 'test-bot',
    description: 'Test if the bot is working',
    slash:{
        name: 'test-bot',
        description: 'Test if the bot is working'
    },
    execute(message,args){
        message.channel.send('Gogo\'s Gobo bot is working :)') 
    },
    executeSlash: async (interaction) => {
        interaction.reply('Gogo\'s Gobo bot is working :)') 
    }
}