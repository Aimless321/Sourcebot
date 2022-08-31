const {sendBots, getSeedingEmbed, getSeedingButtons} = require('../modules/seedingBots')

module.exports = {
    name: 'seed-server3',
    async execute(interaction) {
        await sendBots('server3');

        const handlerEmbed = getSeedingEmbed()
            .setColor(0x53fd29)
            .setDescription("40 bots deployed to server 3");

        const buttons = getSeedingButtons(true);

        return interaction.update({embeds: [handlerEmbed], components: buttons});
    }
}