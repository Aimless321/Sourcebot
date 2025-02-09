import {ChatInputCommandInteraction, GuildMember, MessageFlags, SlashCommandBuilder} from "discord.js";
import {ChannelType} from "discord-api-types/v10";
import {discordAdminRoleId} from "../../config.json";
import {VC} from "../models/VC";
import {VCGenerator} from "../models/VCGenerator";


async function memberOwnsTheirChannel(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;
    const voiceState = member.voice;

    if (!voiceState.channel) {
        await interaction.reply({content: 'You\'re not currently in a voice channel', flags: MessageFlags.Ephemeral});
        return false;
    }

    const vcModel = await VC.findByPk(voiceState.channelId);
    if (!vcModel || vcModel.owner !== member.id) {
        await interaction.reply({content: 'You\'re not the owner of your current channel', flags: MessageFlags.Ephemeral});
        return false;
    }

    return true;
}

async function claim(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;
    const voiceState = member.voice;

    if (!voiceState.channel) {
        return interaction.reply({content: 'You\'re not currently in a voice channel', flags: MessageFlags.Ephemeral});
    }

    const vcModel = await VC.findByPk(voiceState.channelId);
    if (!vcModel) {
        return interaction.reply({content: 'Invalid voice channel to claim', flags: MessageFlags.Ephemeral});
    }

    if (vcModel.owner === member.id) {
        return interaction.reply({content: 'You\'re already the owner of this channel', flags: MessageFlags.Ephemeral});

    }

    if (voiceState.channel.members.has(vcModel.owner)) {
        return interaction.reply({content: 'Owner is still in the channel', flags: MessageFlags.Ephemeral});
    }

    vcModel.owner = member.id;
    await vcModel.save();
    return interaction.reply({content: 'Succesfully claimed the channel', flags: MessageFlags.Ephemeral});
}


async function rename(interaction: ChatInputCommandInteraction) {
    if (!await memberOwnsTheirChannel(interaction)) {
        return;
    }

    const member = interaction.member as GuildMember;
    const voiceState = member.voice;

    if (voiceState.channel === null) {
        return interaction.reply({content: 'You have to be in a voice channel to rename it', flags: MessageFlags.Ephemeral});
    }

    const newName = interaction.options.getString('name');

    if (newName === null) {
        return interaction.reply({content: 'You have to provide a name for the channel', flags: MessageFlags.Ephemeral});
    }

    await voiceState.channel.setName(newName);

    return interaction.reply({content: 'Channel has been renamed', flags: MessageFlags.Ephemeral});
}

async function limit(interaction: ChatInputCommandInteraction) {
    if (!await memberOwnsTheirChannel(interaction) || !interaction.member) {
        return;
    }

    const member = interaction.member as GuildMember;
    const voiceState = member.voice;
    const limit = interaction.options.getInteger('limit');

    if (limit === null) {
        return interaction.reply({content: 'Limit has to be a number', flags: MessageFlags.Ephemeral});
    }

    if (limit < 0 || limit > 99) {
        return interaction.reply({content: 'Limit has to be between 0 and 99'});
    }

    if (voiceState.channel === null) {
        return interaction.reply({content: 'You have to be in a voice channel to set a limit'});
    }

    await voiceState.channel.setUserLimit(limit);

    return interaction.reply({content: `Updated limit to ${limit}`, flags: MessageFlags.Ephemeral});
}

async function generate(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;
    if (member == null || !member.roles.cache.has(discordAdminRoleId)) {
        return interaction.reply({content: 'You don\'t have permission for this command', flags: MessageFlags.Ephemeral})
    }

    if (!interaction.guild) {
        return interaction.reply({content: 'This command can only be used in a guild', flags: MessageFlags.Ephemeral});
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

    return interaction.reply({content: `Creating vc generator with ${name}. id ${vc.id}`, flags: MessageFlags.Ephemeral});
}

export const data = new SlashCommandBuilder()
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
    );

export async function execute(interaction: ChatInputCommandInteraction) {
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

    return interaction.reply({content: 'Invalid command, use one of the subcommands', flags: MessageFlags.Ephemeral});
}
