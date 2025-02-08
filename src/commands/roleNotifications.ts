import {ChatInputCommandInteraction, MessageFlags, Role, SlashCommandBuilder} from "discord.js";
import {RoleNotification} from "../models/RoleNotification";

async function validateParameters(interaction: ChatInputCommandInteraction, role: Role | null, content: string | null) {
    if (!role) {
        await interaction.reply({content: 'Invalid role selected', flags: MessageFlags.Ephemeral});
        return false;
    }

    if (!content) {
        await interaction.reply({content: 'Please specify a message', flags: MessageFlags.Ephemeral});
        return false;
    }

    try {
        JSON.parse(content)
    } catch (error) {
        await interaction.reply({content: 'Invalid message JSON', flags: MessageFlags.Ephemeral})
        return false;
    }

    return true;
}

export const data = new SlashCommandBuilder()
    .setName('role-notification')
    .setDescription('Send users a DM when they receive a role')
    .addRoleOption(option => option.setName('role').setDescription('Role the notification has to work for'))
    .addChannelOption(option => option.setName('announcement-channel').setDescription('Channel where the announcement is posted for new members of this role'))
    .addStringOption(option => option.setName('message').setDescription('Content of the DM'));

export async function execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole('role') as Role;
    const content = interaction.options.getString('message');
    const channel = interaction.options.getChannel('announcement-channel');

    if (!await validateParameters(interaction, role, content)) {
        return;
    }

    let notificationModel = await RoleNotification.findOne({where: {role: role.id}});

    if (notificationModel) {
        notificationModel.message = content as string;
        notificationModel.channel = channel?.id ?? null;
        await notificationModel.save();

        return interaction.reply({content: 'Updated role notification', flags: MessageFlags.Ephemeral});
    }

    notificationModel = RoleNotification.build({role: role.id, message: content, channel: channel?.id});
    await notificationModel.save();

    return interaction.reply({content: 'Saved role notification', flags: MessageFlags.Ephemeral});
}