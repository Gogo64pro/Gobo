module.exports =  {
    name: 'ban',
    description: 'Bans a member of the server',
    slash:{
        name: 'ban',
        description: 'Bans a member of the server',
        options:[
            {
                name: 'user',
                description: 'The user to ban',
                type: 6,
                required: true
            },
            {
                name: 'reason',
                type: 3,
                description: 'The reason for the ban',
                required: false
            }
        ]
    },
    async execute(message,args){
        if(bot.owners.includes(message.author.id)||message.member.permissions.has('BAN_MEMBERS')){
            const member = message.mentions.users.first()
            if(member){
                const memberTarget = message.guild.members.cache.get(member.id)
                memberTarget.ban().then(
                    (responce) =>{
                    message.channel.send(`@${message.mentions.users.first().username} was banned`)
                    },
                    (error) => {
                        if(error.code === 50007 || error.code === 50013){
                            message.channel.send('That member has admin/mod and i cannot ban them or there is an error')
                        }
                    }
                )
            }
            else{
                message.channel.send('Please mention the person you want to ban')
            }
        }else{
            message.channel.send('You do not have the required permissions to ban members')
        }
    },
    executeSlash: async (interaction) => {
        const member = interaction.options._hoistedOptions[0].user
        const memberTarget = interaction.member.guild.members.cache.get(member.id)
        const reason = interaction.options._hoistedOptions[1]?.value ?? 'No reason given'
            memberTarget.ban({reason:reason}).then(
                (responce) =>{
                    interaction.reply({content: `@${member.username} was banned`})
                },
                (error) => {
                    if(error.code === 50007 || error.code === 50013){
                        interaction.reply('That member has admin/mod and i cannot ban them or there is an error')
                    }
                })
    }
}