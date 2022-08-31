const {killBots, getSeedingEmbed, getSeedingButtons} = require('../modules/seedingBots');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: 'seed-kill',
    async execute(interaction) {
        await killBots();

        const handlerEmbed = getSeedingEmbed()
            .setColor(0x29bdfd)
            .setDescription("Bots retreating, please stand by");

        await interaction.message.edit({
            embeds: [handlerEmbed]
        });

        const buttons = getSeedingButtons(false);

        await interaction.deferUpdate();
        await wait(2 * 60 * 1000);
        handlerEmbed.setDescription("Bots currently not deployed")

        return interaction.editReply({embeds: [handlerEmbed], components: buttons});
    }
}