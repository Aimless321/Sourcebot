const {sendBots, getSeedingEmbed, getSeedingButtons} = require('../modules/seedingBots')

module.exports = {
    name: 'seed-server2',
    async execute(interaction) {
        await sendBots('server2');

        const handlerEmbed = getSeedingEmbed()
            .setColor(0x53fd29)
            .setDescription("40 bots deployed to server 2");

        const buttons = getSeedingButtons(true);

        return interaction.update({embeds: [handlerEmbed], components: buttons});
    }
}