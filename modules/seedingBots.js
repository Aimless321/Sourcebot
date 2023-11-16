const {botURLs} = require('../config.json');
const {DiscordMessage} = require('../models');
const {ActionRowBuilder, ButtonBuilder, EmbedBuilder, time} = require("discord.js");
const {ButtonStyle} = require("discord-api-types/v10");
const fetch = require('node-fetch-native')

async function sendBots(serverName, who) {
    console.info(`Bots sent to ${serverName} by ${who}`);
    for (const botURL of botURLs) {
        const url = `${botURL}/${serverName}`;
        await fetch(url);
    }
}

async function killBots(who) {
    console.info(`Bots killed by ${who}`);
    for (const botURL of botURLs) {
        const url = `${botURL}/kill`;
        await fetch(url);
    }
}

async function scheduledDeploy(client, server) {
    await killBots('scheduler');
    await sendBots(server, 'scheduler');

    const handlerEmbed = getSeedingEmbed()
        .setColor(0x53fd29)
        .setDescription(`(${time(new Date(), 'f')}) Auto scheduler: 40 bots queued for ${server}`);

    const buttons = getSeedingButtons(true);

    const model = await DiscordMessage.findOne({where: {tag: 'seed-handler'}});
    const channel = await client.channels.fetch(model.channelId);
    const message = await channel.messages.fetch(model.messageId);

    return message.edit({embeds: [handlerEmbed], components: buttons});
}

function getSeedingEmbed() {
    return new EmbedBuilder()
        .setColor(0x29bdfd)
        .setTitle("Seeding Bot Control Center")
        .setDescription("Bots currently not deployed")
        .setFields(
            {
                name: 'How to seed correctly',
                value: '1. Deploy the bots to a server\n2. When the server hits 80 players the bots will automatically leave\n3. Click retreat when all the bots have left the server'
            },
            {
                name: '\u200B',
                value: 'The retreat button will pull all of the bots of the server at the same time. Only use this when needed or if they have already automatically left the server.'
            }
        );
}

function getSeedingButtons(disabled) {
    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('seed-server1')
                    .setLabel('Server 1')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('seed-server2')
                    .setLabel('Server 2')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('seed-server3')
                    .setLabel('Server 3')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
            ),
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('seed-reviver')
                    .setLabel('Enable Auto Revive')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('seed-kill')
                    .setLabel('Retreat')
                    .setStyle(ButtonStyle.Danger),
            )
    ];
}

module.exports = {
    sendBots,
    killBots,
    scheduledDeploy,
    getSeedingEmbed,
    getSeedingButtons
}