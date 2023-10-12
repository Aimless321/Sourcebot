const {
    EmbedBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ButtonBuilder,
    time, userMention, roleMention, hyperlink, blockQuote
} = require('discord.js');
const {TextInputStyle, ButtonStyle} = require("discord-api-types/v10");
const {Event, EventSignup} = require("../models");
const {mandatorySignupRole, roleNotificationConfirmationChannel} = require("../config.json");

const categories = {
    'accept': '<:Accept:1009511793913249812> Accept',
    'decline': '<:Deny:1009512341324443899> Decline',
    'commander': '<:Commander:1009174334109126686> Commander',
    'infantry': '<:Inf:1009174335535202414> Infantry',
    'tank': '<:TankCrew:1009174343701504051> Tank',
    'recon': '<:Sniper:1009174339511394456> Recon',
    'arty': '<:Artillery:1009174331424776292> Artillery'
}


function formatSignups(signups, type) {
    const signupsOfType = signups.filter(signup => signup.type === type);
    if (signupsOfType.length === 0) {
        return [{name: `${categories[type]} (${signupCount(signups, type)})`, value: '-'}];
    }

    const signupList = signupsOfType.map(signup => userMention(signup.discordId)).join('\n');
    const splitPos = signupList.lastIndexOf("\n", 1024 - 24); // Split at less than 1024 for formatting purposes
    const hasToBeSplit = signupList.length > 1024 && splitPos !== -1

    let fields = [{
        inline: true,
        name: `${categories[type]} (${signupCount(signups, type)})`,
        value: blockQuote(hasToBeSplit ? signupList.substring(0, splitPos) : signupList)
    }];

    if (hasToBeSplit) {
        fields.push({
            inline: true,
            name: `​`,
            value: blockQuote(signupList.substring(splitPos + 1))
        });
    }

    return fields;
}

function signupCount(signups, type) {
    return signups.filter(signup => signup.type === type).length;
}

async function getEventEmbed(model) {
    const signups = await model.getEventSignups();

    let fields;
    switch (model.options) {
        case 'signup_generic':
            fields = [
                ...formatSignups(signups, 'accept'),
                ...formatSignups(signups, 'decline')
            ];
            break;
        case 'signup_categories':
            fields = [
                ...formatSignups(signups, 'commander'),
                ...formatSignups(signups, 'infantry'),
                ...formatSignups(signups, 'tank'),
                ...formatSignups(signups, 'recon'),
                ...formatSignups(signups, 'arty'),
                ...formatSignups(signups, 'decline')
            ];
            break;
    }

    return new EmbedBuilder()
        .setTitle(model.name)
        .setDescription(`${time(model.eventDate, 'F')}\n\n${model.description}`)
        .setFields(
            {name: 'Attendee role', value: roleMention(model.attendeeRole)},
            {
                name: 'Links',
                value: hyperlink('Add to Google Calendar', `http://www.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(model.name)}&details=&location=&dates=${new Date(model.eventDate.getTime()).toISOString().replace(/[^\w\s]/gi, '')}/${new Date(model.eventDate.getTime() + 90 * 60000).toISOString().replace(/[^\w\s]/gi, '')}`)
            },
            ...fields
        );
}

function getEventMentions(model) {
    return model.mentionRoles?.map(roleId => roleMention(roleId)).join(' ');
}

function getEventButtons(model) {
    switch (model.options) {
        case 'signup_generic':
            return [
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder().setEmoji('1009511793913249812').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-accept'),
                        new ButtonBuilder().setEmoji('1009512341324443899').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-decline'))
            ];
        case 'signup_categories':
            return [
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder().setEmoji('1009174334109126686').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-commander'),
                        new ButtonBuilder().setEmoji('1009174335535202414').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-infantry'),
                        new ButtonBuilder().setEmoji('1009174343701504051').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-tank')
                    ),
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder().setEmoji('1009174339511394456').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-recon'),
                        new ButtonBuilder().setEmoji('1009174331424776292').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-arty'),
                        new ButtonBuilder().setEmoji('1009512341324443899').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-decline')
                    )
            ];
        default:
            return [];
    }
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

async function collectSignUpInfo(interaction, model) {
    const embed = await getEventEmbed(model);

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

    const optionsSelect = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('signup-mention-options')
                .setPlaceholder('Select signup options')
                .setOptions(
                    {
                        label: 'Accept / Decline',
                        value: 'signup_generic',
                        default: true
                    },
                    {
                        label: 'Commander / Infantry / Tank / Recon / Arty',
                        value: 'signup_categories',
                    }
                )
        );

    const buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('signup-info-submit')
                .setStyle(ButtonStyle.Success)
                .setLabel('Submit')
        )

    const message = await interaction.reply({
        content: 'Please specify additional sign up details',
        ephemeral: true,
        components: [attendeeSelect, mentionSelect, optionsSelect, buttonRow],
        embeds: [embed],
        fetchReply: true
    });

    const filter = i => {
        if (!i.isButton()) {
            handleValueChange(i, model);
            i.deferUpdate();
        }

        return i.user.id === interaction.user.id && i.isButton();
    };

    return message.awaitMessageComponent({filter, time: 300_000})
        .then(interaction => {
            return interaction;
        }).catch(console.error);
}

async function handleValueChange(interaction, model) {
    switch (interaction.customId) {
        case 'signup-attendee-role':
            model.attendeeRole = interaction.values[0];
            break;
        case 'signup-mention-roles':
            model.mentionRoles = interaction.values;
            break;
        case 'signup-mention-options':
            model.options = interaction.values[0];
            break;
    }

    await model.save();
}

function stripquotes(a) {
    if (a.charAt(0) === '"' && a.charAt(a.length - 1) === '"') {
        return a.substr(1, a.length - 2);
    }
    return a;
}

async function confirmInfo(interaction, model) {
    const eventEmbed = await getEventEmbed(model);

    const confirmButtons = new ActionRowBuilder().setComponents(
        new ButtonBuilder()
            .setCustomId('signup-create-confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('signup-create-cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
    );

    const message = await interaction.reply({
        ephemeral: true,
        embeds: [eventEmbed],
        components: [confirmButtons],
        fetchReply: true
    });

    return message.awaitMessageComponent({time: 300_000})
        .then(interaction => {
            return [interaction, interaction.customId === 'signup-create-confirm'];
        }).catch(() => {
            console.log('Confirmation expired');
            return [interaction, false];
        });
}


async function postEventMessage(channel, eventModel) {
    const mentions = getEventMentions(eventModel);
    const embed = await getEventEmbed(eventModel);
    const buttons = getEventButtons(eventModel);

    return await channel.send({content: mentions, embeds: [embed], components: buttons});
}

function formatListToFields(list, title, formatFunction) {
    const formattedList = list.map(x => formatFunction(x)).join('\n');
    let splitPos = formattedList.lastIndexOf("\n", 1024-24); // Split at less than 1024 for formatting purposes
    const hasToBeSplit = formattedList.length > 1024 && splitPos !== -1

    let fields = [{
        inline: true,
        name: title,
        value: blockQuote(hasToBeSplit ? formattedList.substring(0, splitPos) : formattedList)
    }];

    if (!hasToBeSplit)
        return fields;

    let remainder = formattedList.substring(splitPos + 1);
    while (remainder.length > 1024) {
        splitPos = remainder.lastIndexOf("\n", 1024-24); // Split at less than 1024 for formatting purposes

        fields.push({
            inline: true,
            name: `​`,
            value: blockQuote(remainder.substring(0, splitPos))
        });

        remainder = remainder.substring(splitPos + 1);
    }

    return fields;
}

async function getMembersThatHaveNotReplied(guild, event) {
    const repliedBy = (await event.getEventSignups()).map(signup => signup.discordId);
    const mandatoryRole = await guild.roles.fetch(mandatorySignupRole, {force: true});
    const members = mandatoryRole.members;

    return members.filter(member => !repliedBy.includes(member.id) && !member.user.bot);
}

module.exports = {
    async createNewSignUp(interaction) {
        const [interaction2, eventModel] = await collectEventDetails(interaction);


        const interaction3 = await collectSignUpInfo(interaction2, eventModel);
        const [interaction4, confirmed] = await confirmInfo(interaction3, eventModel);

        if (!confirmed) {
            await eventModel.destroy();

            return await interaction4.reply({ephemeral: true, content: 'Event creation cancelled.'});
        }

        const message = await postEventMessage(interaction.channel, eventModel);
        eventModel.channelId = message.channelId;
        eventModel.messageId = message.id;
        await eventModel.save();

        return await interaction4.reply({ephemeral: true, content: 'Event created'});
    },
    async removeSignUpForm(model, client) {
        await model.destroy();

        try {
            const channel = await client.channels.fetch(model.channelId, {force: true});
            const message = await channel.messages.fetch(model.messageId);

            if (model.attendeeRole) {
                const role = message.guild.roles.cache.get(model.attendeeRole);
                const data = {
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    position: role.position,
                    permissions: role.permissions,
                    mentionable: role.mentionable
                };

                await role.delete('Emptying role');
                await message.guild.roles.create({data});
            }

            await message.delete();
            await EventSignup.destroy({where: {eventId: model.id}});
            await model.destroy();
        } catch (e) {
            console.error(e);
            return false;
        }


        return true;
    },
    async updateSignup(interaction, model) {
        const embed = await getEventEmbed(model);

        await interaction.message.edit({embeds: [embed]});
    },
    async sendRemindersForEvent(client, event, hoursTillEvent) {
        const channel = await client.channels.fetch(event.channelId);
        const message = await channel.messages.fetch(event.messageId);
        const members = await getMembersThatHaveNotReplied(message.guild, event);

        console.log(`Found ${members.size} mandatory signup members`);

        const embed = new EmbedBuilder()
            .setTitle('The Circle - Signup reminder')
            .setDescription(`
                    We ask all of our comp members to reply to all matches, even if you can't make it to the event.
                    
                    Please reply to [${event.name}](${message.url}) - ${time(event.eventDate, 'F')}`
            );

        let remindersSent = 0;
        const successfulReminders = [];
        const failedReminders = [];
        const messages = [];
        members.forEach(member => {
            const message = member.send({embeds: [embed]}).then(() => {
                remindersSent++;
                console.log('Reminder sent to', member.displayName);
                successfulReminders.push(member);
            }).catch(() => {
                console.error('Cannot send DM to', member.displayName);
                failedReminders.push(member);
            });

            messages.push(message);
        });
        await Promise.all(messages);

        const formatFunction = member => `${member.toString()} (${member.displayName})`;
        const fields = formatListToFields(
            successfulReminders,
            `Sent DMs to: (${successfulReminders.length})`,
            formatFunction
        );
        fields.push({
            inline: true,
            name: `​`,
            value: '​'
        });
        fields.push(...formatListToFields(
            failedReminders,
            `Couldn't send DMs to: (${failedReminders.length})`,
            formatFunction
        ));

        const confirmationChannel = await client.channels.fetch(roleNotificationConfirmationChannel);
        await confirmationChannel.send({
            embeds: [{
                title: "Sent sign up reminders",
                description: `${remindersSent} reminders sent for ${event.name} (${hoursTillEvent} hours till event)`,
                color: 501760,
                fields
            }]
        }).catch(error => {
            console.info('Failed to send signup confirmation');
            console.error(error);
        });
    },
    formatListToFields,
    getMembersThatHaveNotReplied
}