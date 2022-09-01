const {botURLs} = require('../config.json');
const {ActionRowBuilder, ButtonBuilder, EmbedBuilder} = require("discord.js");
const {ButtonStyle} = require("discord-api-types/v10");
const fetch = require('node-fetch-native')

module.exports = {
    async sendBots(serverName, who) {
        console.log(new Date(), `Bots sent to ${serverName} by ${who}`);
        for (const botURL of botURLs) {
            const url = `${botURL}/${serverName}`;
            await fetch(url);
        }
    },
    async killBots(who) {
        console.log(new Date(), `Bots killed by ${who}`);
        for (const botURL of botURLs) {
            const url = `${botURL}/kill`;
            await fetch(url);
        }
    },
    getSeedingEmbed() {
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
    },
    getSeedingButtons(disabled) {
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
                    new ButtonBuilder()
                        .setCustomId('seed-cm1')
                        .setLabel('CM 1')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(disabled),
                    new ButtonBuilder()
                        .setCustomId('seed-cm2')
                        .setLabel('CM 2')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(disabled),
                ),
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('seed-kill')
                        .setLabel('Retreat')
                        .setStyle(ButtonStyle.Danger),
                )
        ];
    }
}