import {patreonId, patreonUrl} from "../../config.json";
import sequelize from "sequelize";
import {
    ActionRowBuilder, BaseMessageOptions,
    ButtonBuilder,
    Client,
    EmbedBuilder,
    InteractionReplyOptions, MessageEditOptions,
    MessagePayload
} from "discord.js";
import {ButtonStyle} from "discord-api-types/v10";
import {CostOverview} from "../models/CostOverview";
import {Cost} from "../models/Cost";
import {Contribution} from "../models/Contribution";

function progressBar(value: number, maxValue: number, size: number) {
    const percentage = value / maxValue; // Calculate the percentage of the bar
    const progress = Math.round((size * percentage)); // Calculate the number of square caracters to fill the progress side.
    const emptyProgress = size - progress < 0 ? 0 : size - progress; // Calculate the number of dash caracters to fill the empty progress side.

    const progressText = '▇'.repeat(progress); // Repeat is creating a string with progress * caracters in it
    const emptyProgressText = '—'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
    const percentageText = Math.round(percentage * 100) + '%'; // Displaying the percentage of the bar

    // Creating the bar
    return '```[' + progressText + emptyProgressText + '] ' + percentageText + '```';
}

export async function getCostsEmbed(): Promise<BaseMessageOptions> {
    const PATREON_API_URL = `https://www.patreon.com/api/campaigns/${patreonId}`;
    const res = await fetch(PATREON_API_URL);
    const patreonContributions = (await res.json()).data.attributes.pledge_sum;

    const contributions = await Contribution.findOne({
        attributes: [
            [sequelize.fn("SUM", sequelize.col("amount")), "total"],
        ],
        raw: true
    });

    // @ts-ignore
    const totalContributions = patreonContributions + contributions.total;

    const costs = await Cost.findAll({order: [["amount", "DESC"]]});

    let totalCosts = 0;
    let costsString = "";
    for (const cost of costs) {
        totalCosts += cost.amount;
        costsString += `${cost.title}: €${(cost.amount / 100).toFixed(2)}\n`;
    }

    const embed = new EmbedBuilder()
        .setColor(0xd4af37)
        .setTitle("The Circle needs your support!")
        .setDescription("All of our costs are covered by our members and donations through our [Patreon](https://www.patreon.com/CircleGaming).\n")
        .setFields(
            {
                name: 'Monthly cost breakdown',
                value: `${costsString}\nTotal costs: €${(totalCosts / 100).toFixed(2)}`
            },
            {
                name: 'Current contributions (Patreon + Sponsors)',
                value: `€${(totalContributions / 100).toFixed(2)}\n${progressBar(totalContributions, totalCosts, 22)}`
            }
        );

    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Patreon')
                .setURL(patreonUrl)
                .setStyle(ButtonStyle.Link),
        )

    return {embeds: [embed], components: [buttons]};
}

export async function updateCostOverviews(client: Client) {
    console.info('Updating cost overviews');

    const overviews = await CostOverview.findAll();

    for (const overview of overviews) {
        const channel = await client.channels.fetch(overview.channelId);
        if (!channel || !channel.isTextBased()) {
            continue;
        }

        const message = await channel.messages.fetch(overview.messageId);

        const costsEmbed = await getCostsEmbed();
        await message.edit(costsEmbed);
    }
}
