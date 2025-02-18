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
    const costs = await Cost.findAll({order: [["amount", "DESC"]]});

    let totalCosts = 0;
    let costsString = "";
    for (const cost of costs) {
        totalCosts += cost.amount;
        costsString += `• ${cost.title}: €${(cost.amount / 100).toFixed(2)}\n`;
    }

    const embed = new EmbedBuilder()
        .setColor(0xd4af37)
        .setTitle("Support The Circle! 💥")
        .setDescription(
            "Your donation supports our community and allows us to keep our servers thriving. " +
            "Enjoy one of the most affordable VIP access options available, offering premium benefits without breaking the bank. " +
            "All expenses are covered by contributions made through our [Patreon](https://www.patreon.com/CircleGaming)."
        )
        .addFields(
            {
                name: "Monthly Cost Breakdown 💸",
                value: `${costsString}**Total:** €${(totalCosts / 100).toFixed(2)}\n`,
                inline: false
            },
            {
                name: "Why Donate? 🎖️",
                value: "• **Skip the Queue:** Instantly access VIP servers without waiting.\n" +
                    "• **Exclusive Commands:** Unlock special Discord & in-game perks.\n" +
                    "• **VIP Perks:** Enjoy bonus VIP days to share with a friend.",
                inline: false
            }
        )
        .setFooter({
            text: "Support The Circle by donating today.",
            iconURL: "https://cdn.discordapp.com/attachments/1008449825982926938/1341353683572621362/the-circle-large-rotating.gif?ex=67b5b077&is=67b45ef7&hm=c4dee7c2e67bd744b273ca30f5afb2c00316fe38b6a505d85c833512b86b5276&"
        })

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel("Donate Here")
                .setURL(patreonUrl)
                .setStyle(ButtonStyle.Link)
        );

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