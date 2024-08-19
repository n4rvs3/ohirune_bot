require("dotenv").config();

const { Client, Events, GatewayIntentBits, Partials } = require("discord.js");

const token = process.env.DISCORD_TOKEN;
const BOT_LOG_CHANNEL_ID = process.env.BOT_LOG_CHANNEL_ID;
const MEMBER_ADD_ROLE_ID = process.env.MEMBER_ADD_ROLE_ID;
const REACT_MESSAGE_ID = process.env.REACT_MESSAGE_ID;
const TARGET_EMOJI = process.env.TARGET_EMOJI;
const REACTED_ROLE_ID = process.env.REACTED_ROLE_ID;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.User,
	],
});

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// サーバー参加時に会員ロールを付与
client.on("guildMemberAdd", async (member) => {
	const role = member.guild.roles.cache.get(MEMBER_ADD_ROLE_ID);
	const bot_log = member.guild.channels.cache.get(BOT_LOG_CHANNEL_ID);

	try {
		await member.roles.add(role);
		await bot_log.send(`${member.user.tag} に会員ロールを付与しました。`);
	} catch (error) {
		console.error("会員ロールの付与に失敗しました。", error);
		await bot_log.send(
			`${member.user.tag} への会員ロール付与に失敗しました。エラー: ${error.message}`,
		);
	}
});

// リアクション追加時に通知ロールを付与
client.on("messageReactionAdd", async (reaction, user) => {
	try {
		if (reaction.partial) {
			await reaction.fetch();
		}
		if (reaction.message.partial) {
			await reaction.message.fetch();
		}

		if (user.bot) return;

		if (
			reaction.message.id === REACT_MESSAGE_ID &&
			reaction.emoji.name === TARGET_EMOJI
		) {
			const guild = reaction.message.guild;
			const member = guild.members.cache.get(user.id);
			const bot_log = guild.channels.cache.get(BOT_LOG_CHANNEL_ID);
			const role = guild.roles.cache.get(REACTED_ROLE_ID);

			if (member && role) {
				await member.roles.add(role);
				await bot_log.send(`${member.user.tag} に通知ロールを付与しました。`);
			} else {
				console.error("Member or role not found.");
				await bot_log.send(
					`${member.user.tag} への通知ロール付与に失敗しました。`,
				);
			}
		}
	} catch (error) {
		console.error("Error in messageReactionAdd event:", error);
	}
});

client.on("messageReactionRemove", async (reaction, user) => {
	try {
		if (reaction.partial) {
			await reaction.fetch();
		}
		if (reaction.message.partial) {
			await reaction.message.fetch();
		}

		if (user.bot) return;

		if (
			reaction.message.id === REACT_MESSAGE_ID &&
			reaction.emoji.name === TARGET_EMOJI
		) {
			const guild = reaction.message.guild;
			const member = guild.members.cache.get(user.id);
			const bot_log = guild.channels.cache.get(BOT_LOG_CHANNEL_ID);
			const role = guild.roles.cache.get(REACTED_ROLE_ID);
			console.log("member", member);
			console.log("role", role);

			if (member && role) {
				await member.roles.remove(role);
				await bot_log.send(`${member.user.tag} から通知ロールを削除しました。`);
			} else {
				console.error("Member or role not found.");
				await bot_log.send(
					`ユーザー (ID: ${user.id}) からの通知ロール削除に失敗しました。`,
				);
			}
		}
	} catch (error) {
		console.error("Error in messageReactionRemove event:", error);
	}
});

client.login(token);
