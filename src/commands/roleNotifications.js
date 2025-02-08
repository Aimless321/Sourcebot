const {SlashCommandBuilder} = require("discord.js");
const {RoleNotification} = require("../models");

function validateParameters(interaction, role, content) {
    if (!role) {
        interaction.reply({content: 'Invalid role selected', ephemeral: true});
        return false;
    }

    if (!content) {
        interaction.reply({content: 'Please specify a message', ephemeral: true});
        return false;
    }

    try {
        JSON.parse(content)
    } catch (error) {
        interaction.reply({content: 'Invalid message JSON', ephemeral: true})
        return false;
    }

    return true;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role-notification')
        .setDescription('Send users a DM when they receive a role')
        .addRoleOption(option => option.setName('role').setDescription('Role the notification has to work for'))
        .addChannelOption(option => option.setName('announcement-channel').setDescription('Channel where the announcement is posted for new members of this role'))
        .addStringOption(option => option.setName('message').setDescription('Content of the DM')),
    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const content = interaction.options.getString('message');
        const channel = interaction.options.getChannel('announcement-channel');

        if (!validateParameters(interaction, role, content)) {
            return;
        }

        let notificationModel = await RoleNotification.findOne({where: {role: role.id}});

        if (notificationModel) {
            notificationModel.message = content;
            notificationModel.channel = channel.id;
            await notificationModel.save();

            return interaction.reply({content: 'Updated role notification', ephemeral: true});
        }

        notificationModel = RoleNotification.build({role: role.id, message: content, channel: channel.id});
        await notificationModel.save();

        return interaction.reply({content: 'Saved role notification', ephemeral: true});
    },
};