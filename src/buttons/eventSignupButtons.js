const {Event, EventSignup} = require("../models");
const {updateSignup, removeSignUpForm, editSignUp} = require("../modules/signup");
const {EmbedBuilder} = require("discord.js");
const {adminRoleId} = require("../../config.json");

async function execute(interaction) {
    const eventModel = await Event.findOne({where: {messageId: interaction.message.id}});
    const selectedOption = interaction.customId.split('-')[2];

    if (selectedOption === 'edit') {
        if (!interaction.member.roles.cache.has(adminRoleId)) {
            return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
        }

        return editSignUp(interaction, eventModel);
    }

    await EventSignup.upsert({eventId: eventModel.id, discordId: interaction.member.id, type: selectedOption})
    await updateSignup(interaction, eventModel);

    if (eventModel.attendeeRole && selectedOption !== 'decline') {
        await interaction.member.roles.add(eventModel.attendeeRole);
    } else if (interaction.member.roles.cache.has(eventModel.attendeeRole)) {
        await interaction.member.roles.remove(eventModel.attendeeRole);
    }

    if (!interaction.message.hasThread) {
        await interaction.message.startThread({name: 'Signup Log'});
    }

    const updateEmbed = new EmbedBuilder()
        .setColor(selectedOption === 'decline' ? 0xb22828 : 0x34e718)
        .setTitle(selectedOption === 'decline' ? 'Declined' : 'Accepted')
        .setDescription(`${interaction.member.toString()} (${interaction.member.displayName})\n${interaction.member.id}`);

    await interaction.message.thread.send({embeds: [updateEmbed]})

    return interaction.reply({ephemeral: true, content: `You've selected ${selectedOption} for ${eventModel.name}`});
}

module.exports = {
    name: [
        'event-signup-accept',
        'event-signup-decline',
        'event-signup-commander',
        'event-signup-infantry',
        'event-signup-tank',
        'event-signup-recon',
        'event-signup-arty',
        'event-signup-edit',
    ],
    execute
}
