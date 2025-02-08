import {
    CacheType,
    ChatInputCommandInteraction,
    EmbedBuilder, Guild,
    GuildMember,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";
import {discordAdminRoleId} from "../../config.json";
import {updateCostOverviews} from "../modules/costs";
import {Contribution} from "../models/Contribution";


async function addContribtuon(interaction: ChatInputCommandInteraction<CacheType>) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    if (!user || !amount) {
        return await interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: 'Both user and amount are required'
        });
    }

    await Contribution.upsert({discordId: user.id, amount});

    await updateCostOverviews(interaction.client);

    return await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: `Contribution added for ${user.toString()}: ${(amount / 100).toFixed(2)}`
    })
}

async function listContributions(interaction: ChatInputCommandInteraction<CacheType>) {
    const contributions = await Contribution.findAll();
    const guild = interaction.guild as Guild;

    let contributionsString = "";
    for (const contribution of contributions) {
        try {
            const user = await guild.members.fetch(contribution.discordId);
            contributionsString += `${contribution.id}. ${user.toString()}: ${(contribution.amount / 100).toFixed(2)}\n`;
        } catch (e) {
            contributionsString += `${contribution.id}. ${contribution.discordId}: ${(contribution.amount / 100).toFixed(2)}\n`;
        }
    }

    const embed = new EmbedBuilder()
        .setColor(0x1F8B4C)
        .setTitle("All Contributions")
        .setFields(
            {
                name: 'List',
                value: contributionsString
            }
        );


    return await interaction.reply({flags: MessageFlags.Ephemeral, embeds: [embed]})
}

async function removeContribution(interaction: ChatInputCommandInteraction<CacheType>) {
    const user = interaction.options.getUser('user');
    if (!user) {
        return await interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: 'Can not find user'
        });
    }

    const count = await Contribution.destroy({where: {discordId: user.id}});

    if (count > 0) {
        await updateCostOverviews(interaction.client);

        return await interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: `Removed contribution of ${user.toString()}`
        });
    }

    return await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: `Can not find contribution of ${user.toString()}`
    });
}

export const data = new SlashCommandBuilder()
    .setName('contributions')
    .setDescription('contributions')
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .addUserOption(input => input.setName('user').setDescription('Who this contribution belongs to').setRequired(true))
            .addNumberOption(input => input.setName('amount').setDescription('Amount in cents').setMinValue(1).setRequired(true))
            .setDescription('Add contributions to the overview')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('Get an overview of all added contributions')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .addUserOption(input => input.setName('user').setDescription('Remove contribution of user').setRequired(true))
            .setDescription('Remove a contribution')
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;

    if (!member.roles.cache.has(discordAdminRoleId)) {
        return interaction.reply({
            content: 'You don\'t have permission for this command',
            flags: MessageFlags.Ephemeral
        })
    }

    switch (interaction.options.getSubcommand()) {
        case 'add':
            return await addContribtuon(interaction);
        case 'list':
            return await listContributions(interaction);
        case 'remove':
            return await removeContribution(interaction);
    }

    return interaction.reply({content: 'Invalid command, use one of the subcommands', flags: MessageFlags.Ephemeral});
}
