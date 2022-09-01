const {sendBots, getSeedingEmbed, getSeedingButtons} = require('../modules/seedingBots')
const {time} = require("discord.js");

module.exports = {
    name: 'seed-server1',
    async execute(interaction) {
        await sendBots('server1', interaction.member.displayName);

        const handlerEmbed = getSeedingEmbed()
            .setColor(0x53fd29)
            .setDescription(`(${time(new Date(), 'f')}) ${interaction.member.toString()}: 40 bots deployed to server 1`);

        const buttons = getSeedingButtons(true);

        return interaction.update({embeds: [handlerEmbed], components: buttons});
    }
}