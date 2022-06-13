const { Client, Intents } = require("discord.js");
//const token = require("./config.json");
const { Permissions } = require('discord.js');
const Sequelize = require('sequelize');


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES] });
var prefix = "=";
const MAX_PLAYER = 1;
var lobbyPlayers = [];
var findPlayer;
var findPlayerInFirst;
var firstLobbyCount;
var firstLobbyCount;
var findAll;

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

client.once("ready", () => {
	player.sync();

	console.log(client.user.username + " is ready!");
});
//token.token

client.login(process.env.TOKEN);


function nameGenerator(name) {
    const generatedName = '`'+ name + '`';
    return generatedName;
}

client.on("messageCreate", async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	

	if (command === 'j') {
		findPlayer = await player.findOne({ where: { dc_id: message.author.id } });
		findPlayerInFirst = await player.findOne({ where: { dc_id: message.author.id, firstLobby: true } });
		firstLobbyCount = await player.count({ where: { firstLobby: true } });
		if ( findPlayerInFirst && firstLobbyCount != MAX_PLAYER ) {

			message.channel.send("Te már joinoltál!");

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
			console.log("updated first and second lobby");
			firstLobbyCount = await player.count({ where: { firstLobby: true } });
			findAll = await player.findAll({ where: { firstLobby: true } });
			lobbyPlayers = [];
			findAll.forEach(e => lobbyPlayers.push(e.nickname));
			message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));

	 	} else if (findPlayer) {
			await player.update({ firstLobby: true }, {
				where: {
					dc_id: message.author.id
				}
			});
			firstLobbyCount = await player.count({ where: { firstLobby: true } });
			findAll = await player.findAll({ where: { firstLobby: true } });
			console.log("updated first lobby");
			lobbyPlayers = [];
			findAll.forEach(e => lobbyPlayers.push(e.nickname));
			message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));

		} else {
			try {
				const valami = await player.create({
					dc_id: message.author.id,
					username: message.author.username,
					nickname: nameGenerator(message.author.username),
					firstLobby: true,
					secondLobby: false
				});
				firstLobbyCount = await player.count({ where: { firstLobby: true } });
				findAll = await player.findAll({ where: { firstLobby: true } });
				console.log(`${valami.username} added.`);
				lobbyPlayers = [];
				findAll.forEach(e => lobbyPlayers.push(e.nickname));
				message.channel.send('> **PLAYERS** (' + firstLobbyCount  + '/' + MAX_PLAYER + ')' + ' **|** ' + lobbyPlayers.join('/'));

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
				message.channel.send('Nem vagy benne!');
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
            const taggedUsername = message.mentions.users.first();
			const getUnpickedPlayer = `SELECT nickname FROM players WHERE team = '${null}' AND nickname = '${taggedUsername}'`;
			const getPlayers = `SELECT nickname FROM players WHERE team = 'unpicked'`;
			
			connection.query(getUnpickedPlayer, function (err, result) {
				if (err) {
					console.log(err);
				} else if (result.length && result.length !== MAX_PLAYER){
					const sql = `INSERT INTO players (dc_id, username, nickname, match_id, team) VALUES ('${taggedUsername.id}', '${taggedUsername.username}', '${nameGenerator(taggedUsername.username)}', 1, '${'unpicked'}');`;
					connection.query(sql, function (err, result) {
						if (err) {
							return console.log(err);
						} else if (result) {
							console.log(taggedUsername.username + ' added to the lobby.');
						}
					});

					connection.query(getPlayers, function (err, result) {
						if (err) {
							return console.log(err);
						} else if (result) {
							message.channel.send('> **Champions League** (' + result.length  + '/' + MAX_PLAYER + ')' + ' **|** ' + result[0].nickname);
						}
					});
				} else {
					message.channel.send('> **Champions League** (' + result.length  + '/' + MAX_PLAYER + ')' + ' **|** ');
				}
			});
        } else {
            message.channel.send({embed: {
                color: 0x0099ff,
                author: { name: 'This command should look like this: "=add @playername"'},
            }});
        }
    } 

});
