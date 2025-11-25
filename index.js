// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers // good for later features
    ]
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        const targetVoiceId = config.VOICE_CHANNEL_ID;
        const alertChannelId = config.TEXT_CHANNEL_ID;
        const helpingRoleId = config.ROLE_ID; // role to ping + skip if user has it

        // Ignore bots
        if (newState.member?.user?.bot) return;

        // Did user just JOIN the target VC?
        const joinedTarget =
            newState.channelId === targetVoiceId &&
            oldState.channelId !== targetVoiceId;

        if (!joinedTarget) return;

        // 🔹 If user ALREADY has the helping role, do nothing
        if (newState.member.roles.cache.has(helpingRoleId)) {
            console.log(`⏩ ${newState.member.user.tag} has helping role, skipping alert.`);
            return;
        }

        const guild = newState.guild;
        const textChannel = guild.channels.cache.get(alertChannelId);

        if (!textChannel) {
            console.log('⚠️ Alert text channel not found.');
            return;
        }

        const roleMention = `<@&${helpingRoleId}>`;
        const userMention = `<@${newState.id}>`;
        const vcName = newState.channel?.name || 'the voice channel';

        await textChannel.send({
            content: `${roleMention} ${userMention} just joined **${vcName}** 🎧`
        });

        console.log(`📢 Mentioned ${helpingRoleId} because ${newState.member.user.tag} joined ${vcName}`);
    } catch (err) {
        console.error('Error in voiceStateUpdate handler:', err);
    }
});

client.login(process.env.TOKEN);
