const Discord = require('discord.js')
const readline = require("readline");
const Client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES",'GUILD_VOICE_STATES'] })
const fs = require('fs')
require('dotenv').config()
const slashCommands = require('./util/slashCommands.js')
const bot = {
    Client : Client,
    prefix : '?',
    owners: ['723790324052394044']
}
Client.commands = new Discord.Collection()
Client.events = new Discord.Collection()
Client.slashCommands = new Discord.Collection()
Client.loadEvents = (bot,reload) => require('./handlers/event.js')(bot,reload);
Client.loadEvents(bot,false);
Client.loadCommands = (bot,reload) => require('./handlers/command.js').init(Client,reload);
Client.loadCommands(Client,false);
module.exports = bot


Client.login(process.env.TOKEN).then(
    () => {
        slashCommands.init(Client)
        process.stdin.setRawMode(true);
        process.stdin.setEncoding('utf8');
        process.stdin.resume();
        process.stdin.on('data', function (key) {
            switch (key) {
                case'\u0003':
                    process.stdout.write('^C')
                    process.exit(0);
                    break;
                case 'r':
                    console.log('Reloading...')
                    Client.loadEvents(bot,true);
                    Client.loadCommands(bot,true);
                    break;
            }
        })
    }
)

