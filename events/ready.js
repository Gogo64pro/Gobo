module.exports = {
    name: 'ready',
    execute: async (bot) => {
        console.log('READY');
        console.log('✅ Bot is ready and scanning for auto-ban targets');
        
        try {
            // Configuration
            const targetGuildId = '1254738977538310247';
            const targetChannelId = '1376299832934793277';

            // Fetch guild and channel with proper error handling
            const guild = await bot.Client.guilds.fetch(targetGuildId).catch(console.error);
            if (!guild) {
                console.error('❌ Failed to fetch guild');
                return;
            }

            const botChannel = await guild.channels.fetch(targetChannelId).catch(console.error);
            if (!botChannel) {
                console.error('❌ Bot channel not found or no access');
                return;
            }

            // Initial message to confirm channel works
            await botChannel.send('🔍 Bot is online and scanning for auto-ban targets...').catch(console.error);

            // Fetch all members with error handling
            let allMembers;
            try {
                await guild.members.fetch();
                allMembers = guild.members.cache;
                console.log(`📊 Fetched ${allMembers.size} members`);
            } catch (fetchError) {
                console.error('❌ Failed to fetch members:', fetchError);
                await botChannel.send('⚠️ Failed to fetch server members! Auto-ban check incomplete.');
                return;
            }

            // Process auto-bans
            let bannedCount = 0;
            const failedBans = [];

            for (const id of bot.autoKick) {
                try {
                    const member = allMembers.get(id);
                    if (member) {
                        try {
                            await member.ban({ reason: 'Auto-ban: Restricted user' });
                            console.log(`🔨 Banned ${member.user.tag} (${id})`);
                            await botChannel.send(`✅ Banned ${member.user.tag} (\`${id}\`)`).catch(console.error);
                            bannedCount++;
                            
                            // Rate limit protection (1 ban per second)
                            await new Promise(resolve => setTimeout(resolve, 1000)); 
                        } catch (banError) {
                            console.error(`❌ Failed to ban ${id}:`, banError);
                            failedBans.push(id);
                            await botChannel.send(`⚠️ Failed to ban <@${id}>: ${banError.message}`).catch(console.error);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error processing ${id}:`, error);
                    failedBans.push(id);
                }
            }

            // Final report
            const summary = [
                `**Auto-ban process completed**`,
                `✅ Successfully banned: ${bannedCount}`,
                `❌ Failed to ban: ${failedBans.length}`
            ].join('\n');

            await botChannel.send(summary).catch(console.error);
            console.log(`🏁 Auto-ban process completed. Banned ${bannedCount}, failed ${failedBans.length}`);

        } catch (globalError) {
            console.error('💥 CRITICAL ERROR IN READY EVENT:', globalError);
            // Try to find any channel to send error to
            if (bot.Client.channels.cache.get(targetChannelId)) {
                await bot.Client.channels.cache.get(targetChannelId)
                    .send('💥 CRITICAL ERROR IN STARTUP PROCESS! Check console logs.')
                    .catch(console.error);
            }
        }
    }
};