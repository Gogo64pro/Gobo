module.exports = {
    name: 'message',
    execute: (bot, message) => {
        if(message.author.bot) return;
        if(message.content.startsWith(bot.prefix)){
            const args = message.content.slice(bot.prefix.length).split(/ +/)
            const command = args.shift().toLowerCase()
            const {handle} = require('../handlers/command.js')
            handle(message,command, args, bot)
        }
    }
}