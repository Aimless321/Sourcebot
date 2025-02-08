const {sendBots, getSeedingEmbed, getSeedingButtons} = require('../modules/seedingBots')
const {time} = require("discord.js");

module.exports = {
    name: 'seed-reviver',
    async execute(interaction) {
        await sendBots('reviver', interaction.member.displayName);

        const handlerEmbed = getSeedingEmbed()
            .setColor(0x53fd29)
            .setDescription(`(${time(new Date(), 'f')}) ${interaction.member.toString()}: Auto reviver enabled`);

        const buttons = getSeedingButtons(true);

        return interaction.update({embeds: [handlerEmbed], components: buttons});
    }
}