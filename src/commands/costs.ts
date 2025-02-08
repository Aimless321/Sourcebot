import {
    CacheType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember, GuildTextBasedChannel,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";
import {discordAdminRoleId} from "../../config.json";
import {getCostsEmbed, updateCostOverviews} from "../modules/costs";
import {Cost} from "../models/Cost";
import {CostOverview} from "../models/CostOverview";


async function overview(interaction: ChatInputCommandInteraction<CacheType>) {
    if (interaction.channel === null || interaction.guildId === null) {
        return interaction.reply({content: `Can't generate costs overview in DMs`, flags: MessageFlags.Ephemeral});
    }

    const costOverview = await getCostsEmbed();
    const message = await (interaction.channel as GuildTextBasedChannel).send(costOverview)

    const model = CostOverview.build({
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        messageId: message.id
    });
    await model.save();

    return interaction.reply({content: `Costs overview generated`, flags: MessageFlags.Ephemeral});
}

async function addCost(interaction: ChatInputCommandInteraction<CacheType>) {
    const title = interaction.options.getString('title');
    const amount = interaction.options.getNumber('amount');

    if (!title || !amount) {
        return await interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: `Title and amount are required`
        })
    }

    const model = Cost.build({title, amount});
    await model.save();

    await updateCostOverviews(interaction.client);

    return await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: `Cost added for ${title}: ${(amount / 100).toFixed(2)}`
    })
}

async function listCosts(interaction: ChatInputCommandInteraction<CacheType>) {
    const costs = await Cost.findAll();

    let costsString = "";
    for (const cost of costs) {
        costsString += `${cost.id}. ${cost.title}: ${(cost.amount / 100).toFixed(2)}\n`;
    }

    const embed = new EmbedBuilder()
        .setColor(0x1F8B4C)
        .setTitle("All costs")
        .setFields(
            {
                name: 'List',
                value: costsString
            }
        );


    return await interaction.reply({flags: MessageFlags.Ephemeral, embeds: [embed]})
}

async function removeCost(interaction: ChatInputCommandInteraction<CacheType>) {
    const idToRemove = interaction.options.getNumber('id');
    if (!idToRemove) {
        return await interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: `Id is required`
        })
    }

    const count = await Cost.destroy({where: {id: idToRemove}});

    if (count > 0) {
        await updateCostOverviews(interaction.client);

        return await interaction.reply({flags: MessageFlags.Ephemeral, content: `Removed cost with id: ${idToRemove}`});
    }

    return await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: `Can not find cost with id: ${idToRemove}`
    });
}

export const data = new SlashCommandBuilder()
    .setName('costs')
    .setDescription('costs')
    .addSubcommand(subcommand =>
        subcommand
            .setName('overview')
            .setDescription('Generate a costs overview in the current channel')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .addStringOption(input => input.setName('title').setDescription('Title of the cost').setRequired(true))
            .addNumberOption(input => input.setName('amount').setDescription('Amount in cents').setMinValue(1).setRequired(true))
            .setDescription('Add cost to the overview')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('Get an overview of all added costs')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .addNumberOption(input => input.setName('id').setDescription('Id of cost to remove, see the cost list').setRequired(true))
            .setDescription('Remove a added cost by id')
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
        case 'overview':
            return await overview(interaction);
        case 'add':
            return await addCost(interaction);
        case 'list':
            return await listCosts(interaction);
        case 'remove':
            return await removeCost(interaction);
    }

    return interaction.reply({content: 'Invalid command, use one of the subcommands', flags: MessageFlags.Ephemeral});
}
