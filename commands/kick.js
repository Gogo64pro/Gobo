module.exports =  {
    name: 'kick',
    description: 'Kick a member of the server',
    slash: {
        name: 'kick',
        description: 'Kick a member of the server',
        options:[
            {
                name: 'user',
                description: 'The user to kick',
                type: 6,
                required: true
            },
            {
                name: 'reason',
                description: 'The reason for the kick',
                type: 3,
                required: false
            }
        ]  
    },
    async execute(message,args,alias,bot){
        if(bot.owners.includes(message.author.id)||message.member.permissions.has('KICK_MEMBERS')){
            const member = message.mentions.users.first()
            if(member){
                const memberTarget = message.guild.members.cache.get(member.id)
                memberTarget.kick().then(
                    (responce) =>{
                        message.channel.send(`@${message.mentions.users.first().username} was kicked`)
                    },
                    (error) => {
                        if(error.code === 50007 || error.code === 50013){
                            message.channel.send('That member has admin/mod and I cannot kick them or there is an error')
                        }
                    }
                )
            }
            else{
                message.channel.send('Please mention the person you want to kick')
            }
        }else{
            message.channel.send('You do not have the required permissions to kick members')
        }
    },
    executeSlash: async (interaction) => {
        const member = interaction.options._hoistedOptions[0].user
        const memberTarget = interaction.member.guild.members.cache.get(member.id)
        const reason = interaction.options._hoistedOptions[1]?.value ?? 'No reason given'
            memberTarget.kick({reason:reason}).then(
                (response) =>{
                    interaction.reply({content: `@${member.username} was kicked`})
                },
                (error) => {
                    if(error.code === 50007 || error.code === 50013){
                        interaction.reply('That member has admin/mod and I cannot kick them or there is an error')
                    }
                })
    }
}