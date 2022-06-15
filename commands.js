const { MessageEmbed } = require("discord.js");

function commandEmbed() {
    var embed = new MessageEmbed().setColor('0x0099ff').setTitle('Commands for the Bot:').addFields(
        {
            name: "=j",
            value: "Use this command to join the lobby."
        },
        {
            name: "=l",
            value: "Use this command to leave the lobby."
        },
        {
            name: "=who",
            value: "Use this command to know who is in the lobby."
        },
        {
            name: "=add @playername",
            value: "Use this command to add a player to the lobby."
        },
        {
            name: "=remove @player",
            value: "Use this command to remove a player from the lobby."
        },
        {
            name: "=reset",
            value: "Use this command to reset the lobby. (Batcher and Council members can use it.)"
        },
        {
            name: "=roll",
            value: "Give a number between 1 and 100 cause why not."
        },
        {
            name: "ping",
            value: "Use this command to find out that the bot is online or not."
        },
        );
    return embed;
}


module.exports = { commandEmbed };