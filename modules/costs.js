const {patreonId, patreonUrl, patreonKey} = require("../config.json");
const fetch = require("node-fetch-native");
const {Contribution, Cost, CostOverview} = require("../models");
const sequelize = require("sequelize");
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require("discord.js");
const {ButtonStyle} = require("discord-api-types/v10");
const client = require("../client");

function progressBar(value, maxValue, size) {
    const percentage = value / maxValue; // Calculate the percentage of the bar
    const progress = Math.round((size * percentage)); // Calculate the number of square caracters to fill the progress side.
    const emptyProgress = size - progress < 0 ? 0 : size - progress; // Calculate the number of dash caracters to fill the empty progress side.

    const progressText = '▇'.repeat(progress); // Repeat is creating a string with progress * caracters in it
    const emptyProgressText = '—'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
    const percentageText = Math.round(percentage * 100) + '%'; // Displaying the percentage of the bar

    // Creating the bar
    return '```[' + progressText + emptyProgressText + '] ' + percentageText + '```';
}

async function getCostsEmbed() {
    const PATREON_API_URL = `https://www.patreon.com/api/campaigns/${patreonId}?fields%5Bcampaign%5D=pledge_sum`;
    const res = await fetch(PATREON_API_URL, {
        headers: {
            'Authorization': `Bearer ${patreonKey}`
        }
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch Patreon data: ${res.statusText}`);
    }

    const patreonContributions = (await res.json()).data.attributes.pledge_sum;

    const contributions = await Contribution.findOne({
        attributes: [
            [sequelize.fn("SUM", sequelize.col("amount")), "total"],
        ],
        raw: true
    });

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

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Patreon')
                .setURL(patreonUrl)
                .setStyle(ButtonStyle.Link),
        )

    return {embeds: [embed], components: [buttons]};
}

module.exports = {
    getCostsEmbed,
    async updateCostOverviews(client) {
        console.info('Updating cost overviews');

        const overviews = await CostOverview.findAll();

        for (const overview of overviews) {
            const channel = await client.channels.fetch(overview.channelId);
            const message = await channel.messages.fetch(overview.messageId);

            const costsEmbed = await getCostsEmbed();
            await message.edit(costsEmbed);
        }
    }
}