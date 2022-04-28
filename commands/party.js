module.exports = {
    name: "party",
    description: "Owner only command to party with the bot.",
    execute(message, args, command, bot) {
        if (bot.owners.includes(message.author.id)){
            for(let i = 0; i < args[1]; i++){
                message.channel.send(`Happy birthday <@${message.mentions.users.first().id}>:birthday::birthday::birthday::birthday::birthday::birthday::partying_face::tada::partying_face::tada::partying_face::tada::partying_face::tada::partying_face::tada::partying_face::tada::partying_face::tada::partying_face::tada::partying_face::tada:`)
            }
        }
        else {
            message.channel.send("You're not the owner!");
        }
    }
}