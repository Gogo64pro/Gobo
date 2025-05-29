const ytdl = require('play-dl')
const ytsearch = require('yt-search')
const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior } = require('@discordjs/voice')
const queue = new Map()
const Discord = require('discord.js')

module.exports = {
	disabled: true,
	name: 'play',
	description: 'Plays a song',
	aliases: ['stop', 'skip', 'pause', 'resume', 'queue'],
	async execute(message, args, alias, bot) {
		if (!bot.owners.includes(message.author.id) && bot.annoying == true) {
			message.channel.send('An unknown error ocurred')
			return
		}
		voiceChannel = message.member.voice.channel
		const play = async (guild, song) => {
			const nowQueue = queue.get(guild.id)
			const stream = await ytdl.stream(song.url, {
				quality: 1
			})
			const resource = createAudioResource(stream.stream, {
				inputType: stream.type
			})
			const player = createAudioPlayer({
				behaviors: {
					noSubscriber: NoSubscriberBehavior.Play
				}
			})
			await player.play(resource)
			nowQueue.connection.subscribe(player)
			const Embed = new Discord.EmbedBuilder().setTitle(`Now Playing: ${song.title}`).setImage(song.thumbnail).setColor('#527516')
			nowQueue.textChannel.send({ embeds: [Embed] })
			player.on('error', (err) => {
				nowQueue.textChannel.send('Error playing song\n' + err)
				nowQueue.songs.shift()
				if (nowQueue.songs.length === 0) {
					nowQueue.connection.disconnect()
				} else {
					play(guild, nowQueue.songs[0])
				}
				return 0
			})
			player.on(AudioPlayerStatus.Idle, () => {
				nowQueue.textChannel.send('Finished playing ' + song.title)

				nowQueue.songs.shift()
				if (nowQueue.songs.length === 0) {
					nowQueue.connection.disconnect()
				} else {
					play(guild, nowQueue.songs[0])
				}
			})

			const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
				const newUdp = Reflect.get(newNetworkState, 'udp')
				clearInterval(newUdp?.keepAliveInterval)
			}

			nowQueue.connection.on('stateChange', (oldState, newState) => {
				const oldNetworking = Reflect.get(oldState, 'networking')
				const newNetworking = Reflect.get(newState, 'networking')

				oldNetworking?.off('stateChange', networkStateChangeHandler)
				newNetworking?.on('stateChange', networkStateChangeHandler)
			})
			//If the connection is closed by the user, skip to next song
			nowQueue.connection.on('disconnect', () => {
				nowQueue.textChannel.send('Stopped playing ' + song.title)
				nowQueue.songs.shift()
				if (nowQueue.songs.length === 0) {
					nowQueue.connection.disconnect()
				} else {
					play(guild, nowQueue.songs[0])
				}
			})
		}
		if (!voiceChannel) {
			return message.channel.send('You need to be in a voice channel to play music')
		}
		const permissions = voiceChannel.permissionsFor(message.client.user)
		if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
			return message.channel.send('I need the permissions to join and speak in your voice channel')
		}
		const serverQueue = queue.get(message.guild.id)
		if (alias === 'play') {
			if (!args[0]) {
				return message.channel.send('Please provide a link or a search term')
			}
			let song = {}
			if (ytdl.yt_validate(args[0]) === 'video') {
				const songInfo = await ytdl.video_info(args[0])
				song = {
					title: songInfo.video_details.title,
					url: songInfo.video_details.url,
					thumbnail: songInfo.video_details.thumbnails[0].url || null
				}
			} else {
				const results = await ytsearch(args.join(' '))
				const video = results.videos[0]
				const url = `https://www.youtube.com/watch?v=${video.videoId}`
				const songInfo = await ytdl.video_info(url)
				if (songInfo) {
					song = {
						title: songInfo.video_details.title,
						url: songInfo.video_details.url,
						thumbnail: songInfo.video_details.thumbnails[0].url || null
					}
				} else {
					return message.channel.send('I could not find a song with that search term')
				}
			}
			if (!serverQueue) {
				const queueConstruct = {
					voiceChannel: voiceChannel.id,
					textChannel: message.channel,
					connection: null,
					songs: []
				}
				queue.set(message.guild.id, queueConstruct)
				queueConstruct.songs.push(song)
				try {
					const connection = joinVoiceChannel({
						channelId: voiceChannel.id,
						guildId: message.guild.id,
						adapterCreator: message.guild.voiceAdapterCreator
					})
					queueConstruct.connection = connection
					play(message.guild, queueConstruct.songs[0])
				} catch (err) {
					queue.delete(message.guild.id)
					return message.channel.send('I could not join the voice channel')
				}
			} else {
				serverQueue.songs.push(song)
				return message.channel.send(`${song.title} has been added to the queue`)
			}
		}
		if (alias === 'skip') {
			if (!serverQueue) {
				return message.channel.send('There is nothing playing')
			}
			serverQueue.songs.shift()
			if (serverQueue.songs.length === 0) {
				serverQueue.connection.disconnect()
				queue.delete(message.guild.id)
			} else {
				play(message.guild, serverQueue.songs[0])
			}
		}
		if (alias === 'stop') {
			if (!serverQueue) {
				return message.channel.send('There is nothing playing')
			}
			serverQueue.connection.disconnect()
			serverQueue.textChannel.send('Stopped playing')
			queue.delete(message.guild.id)
		}
		if (alias === 'queue') {
			if (!serverQueue) {
				return message.channel.send('There is nothing playing')
			}
			const queueEmbed = new Discord.EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Queue')
				.setDescription(`${serverQueue.songs.map((song) => `**${song.title}**`).join('\n')}`)
			message.channel.send({ embeds: [queueEmbed] })
		}
	}
}
