import {
    ActionRowBuilder,
    blockQuote,
    ButtonBuilder,
    ButtonInteraction,
    CacheType,
    ChatInputCommandInteraction,
    Client,
    Collection,
    EmbedBuilder,
    Guild,
    GuildMember,
    GuildTextBasedChannel,
    hyperlink, Message,
    MessageComponentInteraction,
    MessageFlags,
    ModalBuilder,
    ModalSubmitInteraction,
    roleMention,
    RoleSelectMenuBuilder,
    RoleSelectMenuInteraction,
    SelectMenuInteraction, Snowflake,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    TextBasedChannel,
    TextInputBuilder,
    time,
    userMention
} from "discord.js";
import {ButtonStyle, TextInputStyle} from "discord-api-types/v10";
import {mandatorySignupRole, roleNotificationConfirmationChannel} from "../../config.json";
import {EventSignup} from "../models/EventSignup";
import {Event} from "../models/Event";
import logging from "../logging";

enum SignupCategory {
    ACCEPT = 'accept',
    DECLINE = 'decline',
    COMMANDER = 'commander',
    INFANTRY = 'infantry',
    TANK = 'tank',
    RECON = 'recon',
    ARTY = 'arty'
}

const categories = {
    'accept': '<:Accept:1009511793913249812> Accept',
    'decline': '<:Deny:1009512341324443899> Decline',
    'commander': '<:Commander:1009174334109126686> Commander',
    'infantry': '<:Inf:1009174335535202414> Infantry',
    'tank': '<:TankCrew:1009174343701504051> Tank',
    'recon': '<:Sniper:1009174339511394456> Recon',
    'arty': '<:Artillery:1009174331424776292> Artillery'
};

function formatSignups(signups: EventSignup[], type: SignupCategory) {
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

function signupCount(signups: EventSignup[], type: SignupCategory) {
    return signups.filter(signup => signup.type === type).length;
}

async function getEventEmbed(model: Event) {
    const signups = await model.getEventSignups();

    let fields;
    switch (model.options) {
        case 'signup_generic':
            fields = [
                ...formatSignups(signups, SignupCategory.ACCEPT),
                ...formatSignups(signups, SignupCategory.DECLINE)
            ];
            break;
        case 'signup_categories':
            fields = [
                ...formatSignups(signups, SignupCategory.COMMANDER),
                ...formatSignups(signups, SignupCategory.INFANTRY),
                ...formatSignups(signups, SignupCategory.TANK),
                ...formatSignups(signups, SignupCategory.RECON),
                ...formatSignups(signups, SignupCategory.ARTY),
                ...formatSignups(signups, SignupCategory.DECLINE)
            ];
            break;
    }

    return new EmbedBuilder()
        .setTitle(model.name)
        .setDescription(`${time(model.eventDate, 'F')}\n\n${model.description}`)
        .setFields(
            model.attendeeRole ? {name: 'Attendee role', value: roleMention(model.attendeeRole)} : {},
            {
                name: 'Links',
                value: hyperlink('Add to Google Calendar', `http://www.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(model.name)}&details=&location=&dates=${new Date(model.eventDate.getTime()).toISOString().replace(/[^\w\s]/gi, '')}/${new Date(model.eventDate.getTime() + 90 * 60000).toISOString().replace(/[^\w\s]/gi, '')}`)
            },
            // @ts-ignore
            ...fields
        );
}

function getEventMentions(model: Event) {
    return model.mentionRoles?.map(roleId => roleMention(roleId)).join(' ');
}

function getEventButtons(model: Event): ActionRowBuilder<ButtonBuilder>[] {
    switch (model.options) {
        case 'signup_generic':
            return [
                new ActionRowBuilder<ButtonBuilder>()
                    .setComponents(
                        new ButtonBuilder().setEmoji('1009511793913249812').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-accept'),
                        new ButtonBuilder().setEmoji('1009512341324443899').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-decline'),
                        new ButtonBuilder().setLabel('Edit').setStyle(ButtonStyle.Primary).setCustomId('event-signup-edit')
                    )
            ];
        case 'signup_categories':
            return [
                new ActionRowBuilder<ButtonBuilder>()
                    .setComponents(
                        new ButtonBuilder().setEmoji('1009174334109126686').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-commander'),
                        new ButtonBuilder().setEmoji('1009174335535202414').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-infantry'),
                        new ButtonBuilder().setEmoji('1009174343701504051').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-tank')
                    ),
                new ActionRowBuilder<ButtonBuilder>()
                    .setComponents(
                        new ButtonBuilder().setEmoji('1009174339511394456').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-recon'),
                        new ButtonBuilder().setEmoji('1009174331424776292').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-arty'),
                        new ButtonBuilder().setEmoji('1009512341324443899').setStyle(ButtonStyle.Secondary).setCustomId('event-signup-decline'),
                        new ButtonBuilder().setLabel('Edit').setStyle(ButtonStyle.Primary).setCustomId('event-signup-edit')
                    )
            ];
        default:
            return [];
    }
}

async function collectEventDetails(interaction: ChatInputCommandInteraction): Promise<[ModalSubmitInteraction, Event]> {
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
        new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(dateInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
    );

    await interaction.showModal(modal);

    // @ts-ignore
    const [newInteraction, model] = await interaction.awaitModalSubmit({time: 300_000})
        .then(interaction => {
            const title = interaction.fields.getTextInputValue('new-signup-title');
            const date = interaction.fields.getTextInputValue('new-signup-date');
            const description = stripquotes(interaction.fields.getTextInputValue('new-signup-description'));

            return [interaction, Event.build({
                name: title,
                options: 'signup_generic',
                mentionRoles: [],
                eventDate: new Date(date),
                description
            })];
        })
        .catch(console.error);

    return [newInteraction, await model.save()];
}

async function collectSignUpInfo(interaction: ModalSubmitInteraction, model: Event): Promise<ButtonInteraction> {
    const embed = await getEventEmbed(model);

    const attendeeSelect = new ActionRowBuilder<RoleSelectMenuBuilder>()
        .addComponents(new RoleSelectMenuBuilder()
            .setCustomId('signup-attendee-role')
            .setPlaceholder('Attendee role'))

    const mentionSelect = new ActionRowBuilder<RoleSelectMenuBuilder>()
        .addComponents(
            new RoleSelectMenuBuilder()
                .setCustomId('signup-mention-roles')
                .setPlaceholder('Don\'t mention any roles')
                .setMaxValues(6),
        );

    const optionsSelect = new ActionRowBuilder<StringSelectMenuBuilder>()
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

    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('signup-info-submit')
                .setStyle(ButtonStyle.Success)
                .setLabel('Submit')
        )

    const response = await interaction.reply({
        content: 'Please specify additional sign up details',
        flags: MessageFlags.Ephemeral,
        components: [attendeeSelect, mentionSelect, optionsSelect, buttonRow],
        embeds: [embed],
        withResponse: true,
    });

    const filter = (i: MessageComponentInteraction) => {
        if (!i.isButton()) {
            // @ts-ignore
            handleValueChange(i, model);
            i.deferUpdate();
        }

        return i.user.id === interaction.user.id && i.isButton();
    };

    if (!response.resource?.message) {
        await interaction.followUp({content: 'Something went wrong..', flags: MessageFlags.Ephemeral});
        logging.error('No message in response to collectSignUpInfo');
        // @ts-ignore
        return;
    }

    // @ts-ignore
    return response.resource.message.awaitMessageComponent({filter, time: 300_000})
        .then(interaction => {
            return interaction;
        }).catch(logging.fatal);
}

async function handleValueChange(interaction: RoleSelectMenuInteraction | StringSelectMenuInteraction, model: Event) {
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

function stripquotes(a: string) {
    if (a.startsWith('"') && a.endsWith('"')) {
        return a.slice(1, -1);
    }
    return a;
}

async function confirmInfo(interaction: ButtonInteraction, model: Event): Promise<[MessageComponentInteraction | null, boolean]> {
    const eventEmbed = await getEventEmbed(model);

    const confirmButtons = new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
            .setCustomId('signup-create-confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('signup-create-cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
    );

    const response = await interaction.reply({
        flags: MessageFlags.Ephemeral,
        embeds: [eventEmbed],
        components: [confirmButtons],
        withResponse: true,
    });

    if (!response.resource?.message) {
        await interaction.followUp({content: 'Something went wrong..', flags: MessageFlags.Ephemeral});
        logging.error('No message in response to confirmInfo');
        return [interaction, false];
    }

    // @ts-ignore
    return response.resource.message.awaitMessageComponent({time: 300_000})
        .then((interaction: MessageComponentInteraction) => {
            return [interaction, interaction.customId === 'signup-create-confirm'];
        }).catch(() => {
            logging.info('Confirmation expired');
            return [null, false];
        });
}


async function postEventMessage(channel: GuildTextBasedChannel, eventModel: Event) {
    const mentions = getEventMentions(eventModel);
    const embed = await getEventEmbed(eventModel);
    const buttons = getEventButtons(eventModel);

    return await channel.send({content: mentions, embeds: [embed], components: buttons});
}

export function formatListToFields(list: any[] | Collection<any, any>, title: string, formatFunction: {
    (member: any): string;
    (member: any): string;
    (arg0: any): any;
}) {
    // @ts-ignore
    const formattedList = list.map((x: any) => formatFunction(x)).join('\n');
    let splitPos = formattedList.lastIndexOf("\n", 1024 - 24); // Split at less than 1024 for formatting purposes
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
        splitPos = remainder.lastIndexOf("\n", 1024 - 24); // Split at less than 1024 for formatting purposes

        fields.push({
            inline: true,
            name: `​`,
            value: blockQuote(remainder.substring(0, splitPos))
        });

        remainder = remainder.substring(splitPos + 1);
    }

    return fields;
}

export async function getMembersThatHaveNotReplied(guild: Guild, event: Event): Promise<Collection<Snowflake, GuildMember>> {
    const repliedBy = (await event.getEventSignups()).map((signup: EventSignup) => signup.discordId);
    const mandatoryRole = await guild.roles.fetch(mandatorySignupRole, {force: true});

    if (!mandatoryRole) {
        console.error('Invalid mandatory signup role');
        return new Collection();
    }

    const members = mandatoryRole.members;

    return members.filter((member: GuildMember) => !repliedBy.includes(member.id) && !member.user.bot);
}

export async function createNewSignUp(interaction: ChatInputCommandInteraction) {
    if (interaction.channel === null) {
        return await interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: 'This command can only be used in a server channel'
        });
    }

    const [interaction2, eventModel] = await collectEventDetails(interaction);
    const interaction3 = await collectSignUpInfo(interaction2, eventModel);
    const [interaction4, confirmed] = await confirmInfo(interaction3, eventModel);

    if (!confirmed) {
        await eventModel.destroy();

        return await interaction.followUp({flags: MessageFlags.Ephemeral, content: 'Event creation cancelled.'});
    }

    const message = await postEventMessage(interaction.channel as GuildTextBasedChannel, eventModel);
    eventModel.channelId = message.channelId;
    eventModel.messageId = message.id;
    await eventModel.save();

    await message.startThread({name: 'Signup Log'});

    // @ts-ignore
    return await interaction4.reply({flags: MessageFlags.Ephemeral, content: 'Event created'});
}

export async function editSignUp(interaction: ButtonInteraction, model: Event) {
    const modal = new ModalBuilder()
        .setCustomId('new-signup-modal')
        .setTitle('Edit sign up');

    const titleInput = new TextInputBuilder()
        .setCustomId('new-signup-title')
        .setLabel("Title")
        .setStyle(TextInputStyle.Short)
        .setValue(model.name);

    const dateInput = new TextInputBuilder()
        .setCustomId('new-signup-date')
        .setLabel("Date and time")
        .setStyle(TextInputStyle.Short)
        .setValue(model.eventDate.toString());

    const descriptionInput = new TextInputBuilder()
        .setCustomId('new-signup-description')
        .setLabel("Description")
        .setStyle(TextInputStyle.Paragraph)
        .setValue(model.description ?? "");

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(dateInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
    );

    await interaction.showModal(modal);

    return interaction.awaitModalSubmit({time: 300_000})
        .then(async interaction => {
            const title = interaction.fields.getTextInputValue('new-signup-title');
            const date = interaction.fields.getTextInputValue('new-signup-date');
            const description = stripquotes(interaction.fields.getTextInputValue('new-signup-description'));

            model.name = title;
            model.eventDate = new Date(date);
            model.description = description;
            await model.save();

            const embed = await getEventEmbed(model);
            // @ts-ignore
            await interaction.message.edit({embeds: [embed]});

            return interaction.reply({content: 'Updated event details', flags: MessageFlags.Ephemeral});
        })
        .catch(console.error);
}

export async function removeSignUpForm(model: Event, client: Client) {
    await model.destroy();

    try {
        if (!model.channelId || !model.messageId) {
            return false;
        }

        const channel = await client.channels.fetch(model.channelId, {force: true});
        if (!channel) {
            return false;
        }

        const message = await (channel as GuildTextBasedChannel).messages.fetch(model.messageId);

        if (model.attendeeRole) {
            const role = message.guild.roles.cache.get(model.attendeeRole);
            if (role) {
                const data = {
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    position: role.position,
                    permissions: role.permissions,
                    mentionable: role.mentionable
                };

                await role.delete('Emptying role');
            }
        }

        await message.delete();
        await EventSignup.destroy({where: {eventId: model.id}});
        await model.destroy();
    } catch (e) {
        console.error(e);
        return false;
    }

    return true;
}

export async function updateSignup(interaction: ButtonInteraction, model: Event) {
    const embed = await getEventEmbed(model);

    await interaction.message.edit({embeds: [embed]});
}

export async function sendRemindersForEvent(client: Client, event: Event, hoursTillEvent?: number) {
    if (!event.channelId || !event.messageId) {
        logging.error('Failed to send reminders for event: Event has no channel or message');
        return;
    }

    const channel = await client.channels.fetch(event.channelId);

    if (!channel) {
        logging.error('Failed to send reminders for event: Channel deleted');
        return;
    }

    const message = await (channel as GuildTextBasedChannel).messages.fetch(event.messageId);
    const members = await getMembersThatHaveNotReplied(message.guild, event);

    console.log(`Found ${members.size} mandatory signup members`);

    const embed = new EmbedBuilder()
        .setTitle('The Circle - Signup reminder')
        .setDescription(`
                    We ask all of our comp members to reply to all matches, even if you can't make it to the event.
                    
                    Please reply to [${event.name}](${message.url}) - ${time(event.eventDate, 'F')}`
        );

    let remindersSent = 0;
    const successfulReminders: GuildMember[] = [];
    const failedReminders: GuildMember[] = [];
    const messages: Promise<any>[] = [];
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

    const formatFunction = (member: GuildMember) => `${member.toString()} (${member.displayName})`;
    const fields = formatListToFields(
        successfulReminders,
        `Sent DMs to: (${successfulReminders.length})`,
        formatFunction
    );
    fields.push({
        inline: true,
        name: `​`,
        // @ts-ignore
        value: '​'
    });
    fields.push(...formatListToFields(
        failedReminders,
        `Couldn't send DMs to: (${failedReminders.length})`,
        formatFunction
    ));

    const confirmationChannel = await client.channels.fetch(roleNotificationConfirmationChannel);
    if (!confirmationChannel) {
        console.error('Failed to send signup confirmation: Confirmation channel not found');
        return;
    }

    await (confirmationChannel as GuildTextBasedChannel).send({
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
}
