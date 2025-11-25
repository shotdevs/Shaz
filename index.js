// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        const targetVoiceId = config.VOICE_CHANNEL_ID;
        const alertChannelId = config.TEXT_CHANNEL_ID;
        const helpingRoleId = config.ROLE_ID;

        if (newState.member?.user?.bot) return;

        const joinedTarget =
            newState.channelId === targetVoiceId &&
            oldState.channelId !== targetVoiceId;

        if (!joinedTarget) return;

        // If user already has helping role, skip
        if (newState.member.roles.cache.has(helpingRoleId)) return;

        const textChannel = newState.guild.channels.cache.get(alertChannelId);
        if (!textChannel) return;

        const roleMention = `<@&${helpingRoleId}>`;
        const userMention = `<@${newState.id}>`;
        const vcName = newState.channel?.name || 'voice channel';

        // ✅ Your requested format
        await textChannel.send({
            content: `${roleMention} **|** ${userMention} is now in **${vcName}** — need help? Join in!`
        });

    } catch (err) {
        console.error('Error in voiceStateUpdate handler:', err);
    }
});

client.login(process.env.TOKEN);
