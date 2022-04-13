const fs = require('fs')
const Discord = require('discord.js')

module.exports={
    init: (Client) => {
        const commandFiles = fs.readdirSync('C:/Users/Gogo/OneDrive/Desktop/Gobo/commands').filter(file => file.endsWith('.js'))

        for(const file of commandFiles){
            const command = require(`C:/Users/Gogo/OneDrive/Desktop/Gobo/commands/${file}`)
            if(command.name){
            Client.commands.set(command.name, command)
            }else{
                continue
            }
        }
        Client.commandFiles = new Discord.Collection()
        Client.commandFiles.set(0,commandFiles)
    },
    handle: (message,command,args,Client) => {
        for(const commandFile of Client.commandFiles.get(0)){
            if(commandFile === `${command}.js` || Client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command))) {
                (Client.commands.get(command) || Client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command))).execute(message, args, command)
                return;
            }
        }
        message.reply('Command not found')
    }
}