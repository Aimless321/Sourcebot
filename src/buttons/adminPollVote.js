const {showNextVote, getVotingEmbed, getAdmin, handleVote} = require("../modules/adminPoll");
const {AdminPollProgress} = require("../models");

async function execute(interaction, progress) {
    let model = await AdminPollProgress.findOne({where: {discordId: interaction.member.id}});
    if (!model) {
        model = AdminPollProgress.build({discordId: interaction.member.id, progress: 0});
        await model.save();
    }

    const admin = await getAdmin(interaction.guild, model, progress)
    if (!admin) {
        await interaction.reply({flags: MessageFlags.Ephemeral, content: 'All votes received, thanks for voting'});
        return;
    }

    const message = await showNextVote(interaction, admin);
    if (!message) {
        console.info(`${interaction.member.displayName} finished voting`)
        return;
    }

    message.awaitMessageComponent({time: 60_000})
        .then(btnInteraction => {
            let emoji;
            switch (btnInteraction.customId) {
                case 'admin-poll-upvote':
                    emoji = '👍';
                    break;
                case 'admin-poll-downvote':
                    emoji = '👎';
                    break;
                case 'admin-poll-neutral':
                    emoji = '🇨🇭';
                    break;
            }
            const embed = getVotingEmbed(admin)
                .setDescription(`Voted ${emoji}`);

            interaction.editReply({embeds: [embed], components: []});

            handleVote(admin, btnInteraction.customId)

            execute(btnInteraction, true);
        })
        .catch(() => {
            return interaction.editReply({embeds: [], components: [], content: 'Poll timeout, you can continue later'});
        });
}

module.exports = {
    name: 'admin-poll',
    execute
}