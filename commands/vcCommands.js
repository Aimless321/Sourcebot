const {SlashCommandBuilder} = require('discord.js');
const {ChannelType} = require('discord-api-types/v10');
const {VCGenerator, VC} = require('../models');
const {discordAdminRoleId} = require('../config.json');

async function memberOwnsTheirChannel(interaction) {
    const member = interaction.member;
    const voiceState = member.voice;

    if (!voiceState.channel) {
        interaction.reply({content: 'You\'re not currently in a voice channel', ephemeral: true});
        return false;
    }

    const vcModel = await VC.findByPk(voiceState.channelId);
    if (!vcModel || vcModel.owner !== member.id) {
        interaction.reply({content: 'You\'re not the owner of your current channel', ephemeral: true});
        return false;
    }

    return true;
}

async function claim(interaction) {
    const voiceState = interaction.member.voice;

    if (!voiceState.channel) {
        return interaction.reply({content: 'You\'re not currently in a voice channel', ephemeral: true});
    }

    const vcModel = await VC.findByPk(voiceState.channelId);
    if (!vcModel) {
        return interaction.reply({content: 'Invalid voice channel to claim', ephemeral: true});
    }

    if (vcModel.owner === interaction.member.id) {
        return interaction.reply({content: 'You\'re already the owner of this channel', ephemeral: true});

    }

    if (voiceState.channel.members.has(vcModel.owner)) {
        return interaction.reply({content: 'Owner is still in the channel', ephemeral: true});
    }

    vcModel.owner = interaction.member.id;
    await vcModel.save();
    return interaction.reply({content: 'Succesfully claimed the channel', ephemeral: true});
}


async function rename(interaction) {
    if(!await memberOwnsTheirChannel(interaction)) {
        return;
    }

    const voiceState = interaction.member.voice;
    const newName = interaction.options.getString('name');
    await voiceState.channel.setName(newName);

    return interaction.reply({content: 'Channel has been renamed', ephemeral: true});
}

async function limit(interaction) {
    if(!await memberOwnsTheirChannel(interaction)) {
        return;
    }

    const voiceState = interaction.member.voice;
    const limit = interaction.options.getInteger('limit')

    if (limit < 0 || limit > 99) {
        return interaction.reply({content: 'Limit has to be between 0 and 99'});
    }

    await voiceState.channel.setUserLimit(limit);

    return interaction.reply({content: `Updated limit to ${limit}`, ephemeral: true});
}

async function generate(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.has(discordAdminRoleId)) {
        return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
    }

    const name = interaction.options.getString('name');

    const channel = await interaction.guild.channels.create({
        name: 'Voice Channels',
        type: ChannelType.GuildCategory
    });

    const vc = await interaction.guild.channels.create({
        name: 'Join To Create VC',
        parent: channel,
        type: ChannelType.GuildVoice
    });

    const vcGenModel = VCGenerator.build({id: vc.id, name, parentId: channel.id})
    await vcGenModel.save();

    return interaction.reply({content: `Creating vc generator with ${name}. id ${vc.id}`, ephemeral: true});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vc')
        .setDescription('Main command for VCs')
        .addSubcommand(subcommand =>
            subcommand
                .setName('claim')
                .setDescription('Claim the voice channel you\'re currently in')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('rename')
                .setDescription('Rename your voice channel')
                .addStringOption(option => option.setName('name').setDescription('New name for your voice channel'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('limit')
                .setDescription('Set a limit on your voice channel')
                .addIntegerOption(option => option.setName('limit').setDescription('Amount of people'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('generate')
                .setDescription('Create a new generator channel')
                .addStringOption(option => option.setName('name').setDescription('Naming scheme to use for generated channels'))
        ),
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'claim':
                return await claim(interaction);
            case 'rename':
                return await rename(interaction);
            case 'limit':
                return await limit(interaction);
            case 'generate':
                return await generate(interaction);
        }

        return interaction.reply({content: 'Invalid command, use one of the subcommands', ephemeral: true});
    },
};