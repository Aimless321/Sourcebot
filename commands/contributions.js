const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');
const {discordAdminRoleId} = require("../config.json");
const {Contribution} = require("../models");
const {updateCostOverviews} = require("../modules/costs");

async function addContribtuon(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    await Contribution.upsert({discordId: user.id, amount});

    await updateCostOverviews(interaction.client);

    return await interaction.reply({ephemeral: true, content: `Contribution added for ${user.toString()}: ${(amount / 100).toFixed(2)}`})
}

async function listContributions(interaction) {
    const contributions = await Contribution.findAll();

    let contributionsString = "";
    for (const contribution of contributions) {
        try {
            const user = await interaction.guild.members.fetch(contribution.discordId);
            contributionsString += `\\${contribution.id}. ${user.toString()}: ${(contribution.amount / 100).toFixed(2)}\n`;
        } catch (e) {
            contributionsString += `\\${contribution.id}. ${contribution.discordId}: ${(contribution.amount / 100).toFixed(2)}\n`;
        }
    }

    const embed = new EmbedBuilder()
        .setColor(0x1F8B4C)
        .setTitle("All Contributions")
        .setFields(
            {
                name: 'List',
                value: contributionsString
            }
        );


    return await interaction.reply({ephemeral: true, embeds: [embed]})
}

async function removeContribution(interaction) {
    const user = interaction.options.getUser('user');
    const count = await Contribution.destroy({where: {discordId: user.id}});

    if (count > 0) {
        await updateCostOverviews(interaction.client);

        return await interaction.reply({ephemeral: true, content: `Removed contribution of ${user.toString()}`});
    }

    return await interaction.reply({ephemeral: true, content: `Can not find contribution of ${user.toString()}`});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('contributions')
        .setDescription('contributions')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .addUserOption(input => input.setName('user').setDescription('Who this contribution belongs to').setRequired(true))
                .addNumberOption(input => input.setName('amount').setDescription('Amount in cents').setMinValue(1).setRequired(true))
                .setDescription('Add contributions to the overview')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Get an overview of all added contributions')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .addUserOption(input => input.setName('user').setDescription('Remove contribution of user').setRequired(true))
                .setDescription('Remove a contribution')
        )
    ,
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(discordAdminRoleId)) {
            return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
        }

        switch (interaction.options.getSubcommand()) {
            case 'add':
                return await addContribtuon(interaction);
            case 'list':
                return await listContributions(interaction);
            case 'remove':
                return await removeContribution(interaction);
        }

        return interaction.reply({content: 'Invalid command, use one of the subcommands', ephemeral: true});
    },
};