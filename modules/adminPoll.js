const {ActionRowBuilder, ButtonBuilder, EmbedBuilder} = require("discord.js");
const {ButtonStyle} = require("discord-api-types/v10");
const {adminRoleId} = require("../config.json");
const {AdminPollVote} = require("../models");

function getVotingEmbed(admin) {
    return new EmbedBuilder()
        .setTitle(`Cast your vote for: ${admin.displayName}`)
        .setDescription(`:thumbsup: If you'd like to keep them as admin\n
                         :thumbsdown: If you don't trust them as admin\n
                         :flag_ch: Neutral vote`);
}

function getVotingButtons() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('admin-poll-upvote')
                .setEmoji('👍')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('admin-poll-downvote')
                .setEmoji('👎')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('admin-poll-neutral')
                .setEmoji('🇨🇭')
                .setStyle(ButtonStyle.Secondary)
        );
}

module.exports = {
    getVotingEmbed,
    async showNextVote(interaction, admin) {
        const embed = getVotingEmbed(admin);
        const buttons = getVotingButtons();

        return await interaction.reply({
            ephemeral: true,
            embeds: [embed],
            components: [buttons],
            fetchReply: true
        });
    },
    async getAdmin(guild, model, progressVote) {
        const adminRole = await guild.roles.fetch(adminRoleId);
        const adminMembers = adminRole.members;
        const voteProgress = progressVote ? ++model.progress : model.progress
        await model.save();

        const admin = adminMembers.at(voteProgress);

        if (!admin) {
            return false;
        }

        return admin;
    },
    async handleVote(admin, vote) {
        const model = AdminPollVote.build({adminId: admin.id, vote: vote});
        await model.save();
    }
}