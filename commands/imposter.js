module.exports = {
    disabled: true,
	name: 'imposter',
	description: 'DMs a random user',
	async execute(message, users,command,bot) {
        try{
            const random = users[Math.floor(Math.random() * users.length)]
            var user = await bot.Client.users.fetch(random)
            user.send('Imposter')
        }catch(err){
            if(!bot.owners.includes(message.author.id))
                message.channel.send(`Not all arguments are IDs`)
            else
                message.channel.send(`Not all arguments are IDs: \`${err}\``)
        }
        
    }
}
