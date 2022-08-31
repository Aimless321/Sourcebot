const {sendBots, getSeedingEmbed, getSeedingButtons} = require('../modules/seedingBots')

module.exports = {
    name: 'seed-server1',
    async execute(interaction) {
        await sendBots('server1');

        const handlerEmbed = getSeedingEmbed()
            .setColor(0x53fd29)
            .setDescription("40 bots deployed to server 1");

        const buttons = getSeedingButtons(true);

        return interaction.update({embeds: [handlerEmbed], components: buttons});
    }
}