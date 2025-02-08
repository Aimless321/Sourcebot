const {sendBots, getSeedingEmbed, getSeedingButtons} = require('../modules/seedingBots')
const {time} = require("discord.js");

module.exports = {
    name: 'seed-server2',
    async execute(interaction) {
        await sendBots('server2', interaction.member.displayName);

        const handlerEmbed = getSeedingEmbed()
            .setColor(0x53fd29)
            .setDescription(`(${time(new Date(), 'f')}) ${interaction.member.toString()}: 40 bots deployed to server 2`);

        const buttons = getSeedingButtons(true);

        return interaction.update({embeds: [handlerEmbed], components: buttons});
    }
}