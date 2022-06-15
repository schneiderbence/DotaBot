const { Client, Intents } = require("discord.js");
//const token = require("./config.json");
const { Permissions } = require('discord.js');
const Sequelize = require('sequelize');
const { Op } = require("sequelize");
const { MessageEmbed } = require('discord.js');


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES] });
var prefix = "=";
const MAX_PLAYER = 10;
var lobbyPlayers = [];
var findPlayer;
var findPlayerInFirst;
var firstLobbyCount;
var firstLobbyCount;
var findAll;
var embed;
const CHANNEL_ID = process.env.CHANNEL;

const sequelize = new Sequelize({
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});


const player = sequelize.define('players', {
	dc_id: {
		type: Sequelize.BIGINT,
		unique: true,
		allowNull: false,
	},
	username: {
		type: Sequelize.STRING
	},
	nickname: {
		type: Sequelize.STRING
	},
	firstLobby: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	secondLobby: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	}
});


try {
	sequelize.authenticate();
	console.log('Connection has been established successfully.');
} catch (error) {
	console.error('Unable to connect to the database:', error);
}

client.once("ready", async () => {
	player.sync();
	console.log(client.user.username + " is ready!");
});
//token.token

client.login(process.env.TOKEN);


function nameGenerator(name) {
    const generatedName = '`'+ name + '`';
    return generatedName;
}


function warningEmbed(text) {
	embed = new MessageEmbed().setTitle(text).setColor(0xff0000);
	return embed;
}


client.on("messageCreate", async (message) => {
	if (message.channel.id = CHANNEL_ID) {
		if (!message.content.startsWith(prefix) || message.author.bot) return;
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();


		if (command === 'ping') {
			message.reply("Pong!");
		}


		if (command === 'roll') {
			message.channel.send(message.author.toString() + ' :point_right: ' + (Math.floor(Math.random() * 100) + 1));
		}


		if (command === 'j') {
			findPlayer = await player.findOne({ where: { dc_id: message.author.id } });
			findPlayerInFirst = await player.findOne({ where: { dc_id: message.author.id, firstLobby: true } });
			firstLobbyCount = await player.count({ where: { firstLobby: true } });
			if ( findPlayerInFirst && firstLobbyCount != MAX_PLAYER ) {
				message.channel.send({ embeds: [warningEmbed('You have already joined the lobby!')] });

			} else if (firstLobbyCount == MAX_PLAYER && findPlayer) {
				await player.update({ firstLobby: false, secondLobby: true }, {
					where: {
						firstLobby: true
					}
				});

				await player.update({ firstLobby: true }, {
					where: {
						dc_id: message.author.id
					}
				});
				console.log(`${findPlayer.username} joined.`);
				firstLobbyCount = await player.count({ where: { firstLobby: true } });
				findAll = await player.findAll({ where: { firstLobby: true } });
				lobbyPlayers = [];
				findAll.forEach(e => lobbyPlayers.push(e.nickname));
				message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));
				if (firstLobbyCount == MAX_PLAYER) {
					message.channel.send('> **Game started! Good luck and have fun boys and girls!**\n' + lobbyPlayers.join(', '));
				}

			} else if (findPlayer) {
				await player.update({ firstLobby: true }, {
					where: {
						dc_id: message.author.id
					}
				});
				firstLobbyCount = await player.count({ where: { firstLobby: true } });
				findAll = await player.findAll({ where: { firstLobby: true } });
				console.log(`${findPlayer.username} joined.`);
				lobbyPlayers = [];
				findAll.forEach(e => lobbyPlayers.push(e.nickname));
				message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));
				if (firstLobbyCount == MAX_PLAYER) {
					message.channel.send('> **Game started! Good luck and have fun boys and girls!**\n' + lobbyPlayers.join(', '));
				}

			} else {
				try {
					const newPlayer = await player.create({
						dc_id: message.author.id,
						username: message.author.username,
						nickname: nameGenerator(message.author.username),
						firstLobby: true,
						secondLobby: false
					});
					firstLobbyCount = await player.count({ where: { firstLobby: true } });
					findAll = await player.findAll({ where: { firstLobby: true } });
					console.log(`${newPlayer.username} joined.`);
					lobbyPlayers = [];
					findAll.forEach(e => lobbyPlayers.push(e.nickname));
					message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));
					if (firstLobbyCount == MAX_PLAYER) {
						message.channel.send('> **Game started! Good luck and have fun boys and girls!**\n' + lobbyPlayers.join(', '));
					}
				}
				catch (error) {
					if (error.name === 'SequelizeUniqueConstraintError') {
						message.channel.send('That tag already exists.');
					}
					message.channel.send('Something went wrong with adding a tag.');
				}
			}
		}


		if (command === 'l') {
			findPlayerInFirst = await player.findOne({ where: { dc_id: message.author.id, firstLobby: true } });
			firstLobbyCount = await player.count({ where: { firstLobby: true } });
				if (findPlayerInFirst) {
					await player.update({ firstLobby: false }, {
						where: {
							dc_id: message.author.id
						}
					});
					firstLobbyCount = await player.count({ where: { firstLobby: true } });
					findAll = await player.findAll({ where: { firstLobby: true } });
					console.log(message.author.username + ' left the lobby.');
					lobbyPlayers = [];
					findAll.forEach(e => lobbyPlayers.push(e.nickname));
					message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));
				} else {
					message.channel.send({ embeds: [warningEmbed('You are not in the lobby!')] });
				}
		}


		if (command === 'who') {
			lobbyPlayers = [];
			findAll = await player.findAll({ where: { firstLobby: true } });
			firstLobbyCount = await player.count({ where: { firstLobby: true } });
			findAll.forEach(e => lobbyPlayers.push(e.nickname));
			message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));
		}


		if (command === "add" && message.member != null && message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			if (message.mentions.users.size) {
				const taggedUser = message.mentions.users.first();
				findPlayer = await player.findOne({ where: { dc_id: taggedUser.id } });
				findPlayerInFirst = await player.findOne({ where: { dc_id: taggedUser.id, firstLobby: true } });
				firstLobbyCount = await player.count({ where: { firstLobby: true } });
				
				if ( findPlayerInFirst && firstLobbyCount != MAX_PLAYER ) {

					message.channel.send({ embeds: [warningEmbed(taggedUser.username + ' has already joined the lobby!')] });

				} else if (firstLobbyCount === MAX_PLAYER && findPlayer) {
					await player.update({ firstLobby: false, secondLobby: true }, {
						where: {
							firstLobby: true
						}
					});

					await player.update({ firstLobby: true }, {
						where: {
							dc_id: taggedUser.id
						}
					});
					console.log(`${findPlayer.username} added.`);
					firstLobbyCount = await player.count({ where: { firstLobby: true } });
					findAll = await player.findAll({ where: { firstLobby: true } });
					lobbyPlayers = [];
					findAll.forEach(e => lobbyPlayers.push(e.nickname));
					message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));
					if (firstLobbyCount == MAX_PLAYER) {
						message.channel.send('> **Game started! Good luck and have fun boys and girls!**\n' + lobbyPlayers.join(', '));
					}

				} else if (findPlayer) {
					await player.update({ firstLobby: true }, {
						where: {
							dc_id: taggedUser.id
						}
					});
					firstLobbyCount = await player.count({ where: { firstLobby: true } });
					findAll = await player.findAll({ where: { firstLobby: true } });
					console.log(`${findPlayer.username} added.`);
					lobbyPlayers = [];
					findAll.forEach(e => lobbyPlayers.push(e.nickname));
					message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));
					if (firstLobbyCount == MAX_PLAYER) {
						message.channel.send('> **Game started! Good luck and have fun boys and girls!**\n' + lobbyPlayers.join(', '));
					}
				} else {
					try {
						const newPlayer = await player.create({
							dc_id: taggedUser.id,
							username: taggedUser.username,
							nickname: nameGenerator(taggedUser.username),
							firstLobby: true,
							secondLobby: false
						});
						firstLobbyCount = await player.count({ where: { firstLobby: true } });
						findAll = await player.findAll({ where: { firstLobby: true } });
						console.log(`${newPlayer.username} added.`);
						lobbyPlayers = [];
						findAll.forEach(e => lobbyPlayers.push(e.nickname));
						message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));
						if (firstLobbyCount == MAX_PLAYER) {
							message.channel.send('> **Game started! Good luck and have fun boys and girls!**\n' + lobbyPlayers.join(', '));
						}
					}
					catch (error) {
						if (error.name === 'SequelizeUniqueConstraintError') {
							message.channel.send('Player already exists.');
						}
						message.channel.send('Something went wrong with adding a player.');
					}
				}
			} else if (command === 'add' && message.member != null && !message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
				message.channel.send({ embeds: [warningEmbed('You have no permission for this command!')] });
			}
		}


		if (command === 'remove' && message.member != null && message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES) ) {
			if (message.mentions.users.size) {
				const taggedUser = message.mentions.users.first();
				findPlayerInFirst = await player.findOne({ where: { dc_id: taggedUser.id, firstLobby: true } });
				firstLobbyCount = await player.count({ where: { firstLobby: true } });
				if (findPlayerInFirst) {
					await player.update({ firstLobby: false }, {
						where: {
							dc_id: taggedUser.id
						}
					});
					firstLobbyCount = await player.count({ where: { firstLobby: true } });
					findAll = await player.findAll({ where: { firstLobby: true } });
					console.log(taggedUser.username + ' removed from lobby.');
					lobbyPlayers = [];
					findAll.forEach(e => lobbyPlayers.push(e.nickname));
					message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));
				} else {
					message.channel.send({ embeds: [warningEmbed(taggedUser.username + ' is not in the lobby!')] });
				}
			} else if (command === 'remove' && message.member != null && !message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
				message.channel.send({ embeds: [warningEmbed('You have no permission for this command!')] });
			}
		}


		if (command === 'reset' && message.member != null && message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			await player.update({ firstLobby: false, secondLobby: false }, {
				where: {
					[Op.or]: [
						{ firstLobby: true },
						{ secondLobby: true }
					]
				}
			});
			console.log(message.author.username + ' reseted the lobby.');
			firstLobbyCount = await player.count({ where: { firstLobby: true } });
			findAll = await player.findAll({ where: { firstLobby: true } });	
			lobbyPlayers = [];
			findAll.forEach(e => lobbyPlayers.push(e.nickname));
			message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));

		} else if (command === 'reset' && message.member != null && !message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			message.channel.send({ embeds: [warningEmbed('You have no permission for this command!')] });
		}
	}
});
