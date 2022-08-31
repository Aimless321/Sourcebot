const {sendBots, getSeedingEmbed, getSeedingButtons} = require('../modules/seedingBots')

module.exports = {
    name: 'seed-cm1',
    async execute(interaction) {
        await sendBots('cm');

        const handlerEmbed = getSeedingEmbed()
            .setColor(0x53fd29)
            .setDescription("40 bots deployed to CM 1");

        const buttons = getSeedingButtons(true);

        return interaction.update({embeds: [handlerEmbed], components: [buttons]});
    }
}