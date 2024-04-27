const {
    SlashCommandBuilder,
} = require('discord.js');
const {adminRoleId} = require("../config.json");
const {
    createNewSignUp,
    removeSignUpForm,
    sendRemindersForEvent,
    getMembersThatHaveNotReplied,
    formatListToFields
} = require("../modules/signup");
const {Event} = require("../models");


async function createSignup(interaction) {
    return await createNewSignUp(interaction);
}

async function deleteSignup(interaction) {
    const eventName = interaction.options.getString('event');
    const eventModel = await Event.findOne({where: {name: eventName}});
    if (!eventModel) {
        return false;
    }

    const success = await removeSignUpForm(eventModel, interaction.client);

    if (!success) {
        return interaction.reply({ephemeral: true, content: `Can't find event with name: ${eventModel.name}`});
    }

    return interaction.reply({ephemeral: true, content: `Signup for ${eventModel.name} removed`});
}

async function remindForEvent(interaction) {
    const eventName = interaction.options.getString('event');
    const eventModel = await Event.findOne({where: {name: eventName}});
    if (!eventModel) {
        return interaction.reply({ephemeral: true, content: `Can't find event with name: ${eventModel.name}`});
    }

    await interaction.deferReply();

    await sendRemindersForEvent(interaction.client, eventModel);
    return interaction.editReply('Signups sent');
}

async function showEventStatus(interaction) {
    const eventName = interaction.options.getString('event');
    const eventModel = await Event.findOne({where: {name: eventName}});
    if (!eventModel) {
        return interaction.reply({ephemeral: true, content: `Can't find event with name: ${eventModel.name}`});
    }

    await interaction.deferReply();

    const members = await getMembersThatHaveNotReplied(interaction.guild, eventModel);

    const fields = formatListToFields(
        members,
        `Members that haven't replied yet: (${members.size})`,
        member => `${member.toString()} (${member.displayName})`
    );

    return await interaction.editReply({
        embeds: [{
            title: `${eventName} - Reply status`,
            fields
        }]
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('signup')
        .setDescription('signup forms and that shit')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create signup form')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete signup')
                .addStringOption(option =>
                    option
                        .setName('event')
                        .setDescription('The event to remove')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remind')
                .setDescription('Remind the required role about an event')
                .addStringOption(option =>
                    option
                        .setName('event')
                        .setDescription('The event to remind about')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Show reply status of an event')
                .addStringOption(option =>
                    option
                        .setName('event')
                        .setDescription('The event you want the status for')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
    ,
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = await Event.findAll({raw: true});
        const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({value: choice.name, name: `${choice.name} (${choice.eventDate.toString()})`})),
        );
    },
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(adminRoleId)) {
            return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
        }

        switch (interaction.options.getSubcommand()) {
            case 'create':
                return await createSignup(interaction);
            case 'delete':
                return await deleteSignup(interaction);
            case 'remind':
                return await remindForEvent(interaction);
            case 'status':
                return await showEventStatus(interaction);
        }

        return interaction.reply({content: 'Invalid command, use one of the subcommands', ephemeral: true});
    },
};