const {SlashCommandBuilder} = require('discord.js');
const {DiscordMessage} = require('../models');
const {adminRoleId} = require("../config.json");
const {getSeedingEmbed, getSeedingButtons} = require("../modules/seedingBots");

async function generate(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.has(adminRoleId)) {
        return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
    }

    const handlerEmbed = getSeedingEmbed();

    const buttons = getSeedingButtons(false);

    const channel = interaction.channel;
    const message = await channel.send({embeds: [handlerEmbed], components: buttons})

    const msgModel = DiscordMessage.upsert({
        tag: 'seed-handler',
        channelId: channel.id,
        messageId: message.id
    })

    return interaction.reply({content: `Generated seeding handler`, ephemeral: true});
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('seed')
        .setDescription('Main command for seeding')
        .addSubcommand(subcommand =>
            subcommand
                .setName('generate')
                .setDescription('Send the embed message for the seeding handler')
        ),
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'generate':
                return await generate(interaction);
        }

        return interaction.reply({content: 'Invalid command, use one of the subcommands', ephemeral: true});
    },
};