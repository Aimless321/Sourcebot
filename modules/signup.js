const {
    EmbedBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ButtonBuilder,
    time,
} = require('discord.js');
const {TextInputStyle, ButtonStyle, ComponentType} = require("discord-api-types/v10");
const {Event} = require("../models");

function getEventEmbed(model) {
    return new EmbedBuilder()
        .setTitle(model.name)
        .setFields(
            {
                name: 'Date and time',
                value: time(model.eventDate, 'F')
            },
            {
                name: 'Description',
                value: model.description
            }
        );
}

async function collectEventDetails(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('new-signup-modal')
        .setTitle('Create a new sign up');

    const titleInput = new TextInputBuilder()
        .setCustomId('new-signup-title')
        .setLabel("Title")
        .setStyle(TextInputStyle.Short);

    const dateInput = new TextInputBuilder()
        .setCustomId('new-signup-date')
        .setLabel("Date and time")
        .setStyle(TextInputStyle.Short);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('new-signup-description')
        .setLabel("Description")
        .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(dateInput),
        new ActionRowBuilder().addComponents(descriptionInput)
    );

    await interaction.showModal(modal);

    const [newInteraction, model] = await interaction.awaitModalSubmit({time: 300_000})
        .then(interaction => {
            const title = interaction.fields.getTextInputValue('new-signup-title');
            const date = interaction.fields.getTextInputValue('new-signup-date');
            const description = stripquotes(interaction.fields.getTextInputValue('new-signup-description'));

            return [interaction, Event.build({name: title, eventDate: date, description})];
        })
        .catch(console.error);

    return [newInteraction, await model.save()];
}

async function selectPreset(interaction, model) {
    const embed = getEventEmbed(model);

    const selectRow = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('signup-preset-select')
                .setPlaceholder('Don\'t use a preset')
                .addOptions(
                    {
                        label: 'Select me',
                        description: 'This is a description',
                        value: 'first_option',
                    },
                    {
                        label: 'You can select me too',
                        description: 'This is also a description',
                        value: 'second_option',
                    },
                ),
        );

    const buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('signup-preset-none')
                .setLabel('Create event manually')
                .setStyle(ButtonStyle.Secondary)
        );

    const message = await interaction.reply({
        ephemeral: true,
        embeds: [embed],
        components: [selectRow, buttonRow],
        content: 'Select preset or start from scratch',
        fetchReply: true
    });

    return await message.awaitMessageComponent({time: 300_000})
        .then(interaction => {
            if (interaction.isStringSelectMenu()) {
                const preset = interaction.values[0];
                console.log(preset);

                return [interaction, true, preset];
            }

            if (interaction.isButton()) {
                return [interaction, false, null];
            }
        }).catch(console.error);
}

async function collectSignUpInfo(interaction, model) {
    const embed = getEventEmbed(model);

    const attendeeSelect = new ActionRowBuilder()
        .addComponents(new RoleSelectMenuBuilder()
            .setCustomId('signup-attendee-role')
            .setPlaceholder('Attendee role'))

    const mentionSelect = new ActionRowBuilder()
        .addComponents(
            new RoleSelectMenuBuilder()
                .setCustomId('signup-mention-roles')
                .setPlaceholder('Don\'t mention any roles')
                .setMaxValues(6),
        );

    const buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('signup-info-submit')
                .setStyle(ButtonStyle.Success)
                .setLabel('Submit')
        )

    const message = await interaction.reply({
        content: 'Select roles to mention and for attendees',
        ephemeral: true,
        components: [attendeeSelect, mentionSelect, buttonRow],
        embeds: [embed],
        fetchReply: true
    });

    const filter = i => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
    };

    return await message.awaitMessageComponent({filter, time: 300_000, componentType: ComponentType.Button})
        .then(interaction => {
            if (interaction.isStringSelectMenu()) {
                const preset = interaction.values[0];
                console.log(preset);

                return [interaction, true, preset];
            }

            if (interaction.isButton()) {
                return [interaction, false, null];
            }
        }).catch(console.error);
}

function stripquotes(a) {
    if (a.charAt(0) === '"' && a.charAt(a.length - 1) === '"') {
        return a.substr(1, a.length - 2);
    }
    return a;
}

module.exports = {
    async createNewSignUp(interaction) {
        const [interaction2, eventModel] = await collectEventDetails(interaction);
        const [interaction3, isPreset, preset] = await selectPreset(interaction2, eventModel);

        if (isPreset) {
            // Apply preset

            return;
        }

        await collectSignUpInfo(interaction3, eventModel);
    },

}