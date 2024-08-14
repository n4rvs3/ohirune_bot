require("dotenv").config();

// Import the discord.js module
const { Client, Events, GatewayIntentBits } = require("discord.js");

// environment variables
const token = process.env.DISCORD_TOKEN;
const BOT_LOG_CHANNEL_ID = process.env.BOT_LOG_CHANNEL_ID;
const MEMBER_ADD_ROLE_ID = process.env.MEMBER_ADD_ROLE_ID;

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// ready event
client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// guildMemberAdd event
client.on("guildMemberAdd", (member) => {
	const role = member.guild.roles.cache.find(
		(role) => role.name === MEMBER_ADD_ROLE_ID,
	);
	const bot_log = member.guild.channels.cache.get(BOT_LOG_CHANNEL_ID);

	try {
		member.roles.add(role);
		bot_log.send(`${member.user.tag} に会員ロールを付与しました。`);
	} catch (error) {
		console.error("会員ロールの付与に失敗しました。", error);
	}
});

client.login(token);
