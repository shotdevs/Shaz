// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Triggered whenever someone joins/leaves/moves VC
client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        const targetVoiceId = config.VOICE_CHANNEL_ID;
        const alertChannelId = config.TEXT_CHANNEL_ID;
        const roleId = config.ROLE_ID;

        // Ignore bots
        if (newState.member?.user?.bot) return;

        // Did user just JOIN the target VC?
        const joinedTarget =
            newState.channelId === targetVoiceId &&
            oldState.channelId !== targetVoiceId;

        if (!joinedTarget) return;

        const guild = newState.guild;
        const textChannel = guild.channels.cache.get(alertChannelId);

        if (!textChannel) {
            console.log('⚠️ Alert text channel not found.');
            return;
        }

        const roleMention = `<@&${roleId}>`;
        const userMention = `<@${newState.id}>`;
        const vcName = newState.channel?.name || 'the voice channel';

        await textChannel.send({
            content: `${roleMention} ${userMention} just joined **${vcName}** 🎧`
        });

        console.log(`📢 Mentioned role ${roleId} because ${newState.id} joined ${vcName}`);
    } catch (err) {
        console.error('Error in voiceStateUpdate handler:', err);
    }
});

client.login(process.env.TOKEN);
