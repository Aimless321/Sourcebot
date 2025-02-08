import {
    AutocompleteInteraction,
    CacheType,
    ChatInputCommandInteraction, GuildMember,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";
import {adminRoleId} from "../../config.json";
import {
    createNewSignUp,
    formatListToFields,
    getMembersThatHaveNotReplied,
    removeSignUpForm,
    sendRemindersForEvent
} from "../modules/signup";
import db from "../models";

const {Event} = db;

async function createSignup(interaction: ChatInputCommandInteraction<CacheType>) {
    return await createNewSignUp(interaction);
}

async function deleteSignup(interaction: ChatInputCommandInteraction<CacheType>) {
    const eventName = interaction.options.getString('event');
    const eventModel = await Event.findOne({where: {name: eventName}});
    if (!eventModel) {
        return false;
    }

    const success = await removeSignUpForm(eventModel, interaction.client);

    if (!success) {
        return interaction.reply({
            content: `Can't find event with name: ${eventModel.name}`,
            flags: MessageFlags.Ephemeral
        });
    }

    return interaction.reply({content: `Signup for ${eventModel.name} removed`, flags: MessageFlags.Ephemeral});
}

async function remindForEvent(interaction: ChatInputCommandInteraction<CacheType>) {
    const eventName = interaction.options.getString('event');
    const eventModel = await Event.findOne({where: {name: eventName}});
    if (!eventModel) {
        return interaction.reply({
            content: `Can't find event with name: ${eventModel.name}`,
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.deferReply();

    await sendRemindersForEvent(interaction.client, eventModel);
    return interaction.editReply('Signups sent');
}

async function showEventStatus(interaction: ChatInputCommandInteraction<CacheType>) {
    const eventName = interaction.options.getString('event');
    const eventModel = await Event.findOne({where: {name: eventName}});
    if (!eventModel) {
        return interaction.reply({
            content: `Can't find event with name: ${eventModel.name}`,
            flags: MessageFlags.Ephemeral
        });
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

export const data = new SlashCommandBuilder()
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
    );

export async function autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const choices = await Event.findAll({raw: true});
    const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));
    await interaction.respond(
        filtered.map(choice => ({value: choice.name, name: `${choice.name} (${choice.eventDate.toString()})`})),
    );
}

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.member) {
        return interaction.reply({
            content: 'You need to be in a guild to use this command',
            flags: MessageFlags.Ephemeral
        });
    }

    const member = interaction.member as GuildMember;
    if (!member.roles.cache.has(adminRoleId)) {
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
}
