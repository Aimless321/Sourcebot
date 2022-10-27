const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    inlineCode
} = require('discord.js');
const {discordAdminRoleId} = require("../config.json");
const {ButtonStyle} = require("discord-api-types/v10");
const {AdminPollVote} = require("../models");
const sequelize = require("sequelize");

async function generate(interaction) {
    const handlerEmbed = new EmbedBuilder()
        .setColor(0x1F8B4C)
        .setTitle("Admin poll")
        .setDescription("Cast your votes on the current admin team");

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('admin-poll')
                .setLabel('Answer')
                .setStyle(ButtonStyle.Primary),
        )

    const channel = interaction.channel;
    await channel.send({embeds: [handlerEmbed], components: [buttons]})

    return interaction.reply({content: `Created admin poll`, ephemeral: true});
}

async function getResults(interaction) {
    const voteResults = await AdminPollVote.findAll({
        attributes: [
            "adminId",
            "vote",
            [sequelize.fn("COUNT", sequelize.col("vote")), "voteCount"],
        ],
        group: ["adminId", "vote"],
        order: ["adminId", "vote"],
        raw: true
    });

    const adminResults = [];
    for (const result of voteResults) {
        const currentResults = adminResults[result.adminId] || {};

        adminResults[result.adminId] = {
            ...currentResults,
            [result.vote]: result.voteCount
        }
    }

    let resultString = "";
    for (const [adminId, votes] of Object.entries(adminResults)) {
        const admin = await interaction.guild.members.fetch(adminId);
        const upVotes = votes['admin-poll-upvote'] || 0;
        const neutralVotes = votes['admin-poll-neutral'] || 0;
        const downVotes = votes['admin-poll-downvote'] || 0;

        const voteString = inlineCode(`👍${upVotes}\t ❓${neutralVotes}\t 👎${downVotes}\n`);
        resultString += `${admin.toString()}: ${voteString}`;
    }


    const resultEmbed = new EmbedBuilder()
        .setTitle('Latest results for admin poll')
        .setDescription(resultString)


    return interaction.reply({embeds: [resultEmbed]});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin-poll')
        .setDescription('admin polls')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Generate an admin poll in the current channel')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('results')
                .setDescription('Post latest results for poll')
        ),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(discordAdminRoleId)) {
            return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
        }

        switch (interaction.options.getSubcommand()) {
            case 'create':
                return await generate(interaction);
            case 'results':
                return await getResults(interaction);
        }

        return interaction.reply({content: 'Invalid command, use one of the subcommands', ephemeral: true});
    },
};