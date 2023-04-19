const {
    SlashCommandBuilder,
} = require('discord.js');
const {adminRoleId} = require("../config.json");
const {createNewSignUp, removeSignUpForm, sendRemindersForEvent} = require("../modules/signup");
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
    return interaction.reply('Signups sent');
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
    ,
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = await Event.findAll({attributes: ['name'], raw: true});
        const filtered = choices.map(choice => choice.name).filter(choice => choice.startsWith(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
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
        }

        return interaction.reply({content: 'Invalid command, use one of the subcommands', ephemeral: true});
    },
};