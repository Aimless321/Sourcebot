const {Event, EventSignup} = require("../models");
const {updateSignup} = require("../modules/signup");

async function execute(interaction) {
    const eventModel = await Event.findOne({where: {messageId: interaction.message.id}});
    const selectedOption = interaction.customId.split('-')[2];
    await EventSignup.upsert({eventId: eventModel.id, discordId: interaction.member.id, type: selectedOption})

    await updateSignup(interaction, eventModel);

    if (selectedOption !== 'decline') {
        await interaction.member.roles.add(eventModel.attendeeRole);
    } else if (interaction.member.roles.cache.has(eventModel.attendeeRole)) {
        await interaction.member.roles.remove(eventModel.attendeeRole);
    }

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
        'event-signup-arty'
    ],
    execute
}