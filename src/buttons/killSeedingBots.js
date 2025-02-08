const {killBots, getSeedingEmbed, getSeedingButtons} = require('../modules/seedingBots');
const {time} = require("discord.js");
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: 'seed-kill',
    async execute(interaction) {
        await interaction.deferUpdate();

        await killBots(interaction.member.displayName);

        const handlerEmbed = getSeedingEmbed()
            .setColor(0x29bdfd)
            .setDescription(`(${time(new Date(), 'f')}) ${interaction.member.toString()}: Bots retreating, please stand by`);

        await interaction.message.edit({
            embeds: [handlerEmbed]
        });

        const buttons = getSeedingButtons(false);

        await wait(2 * 60 * 1000);
        handlerEmbed.setDescription("Bots currently not deployed")

        return interaction.editReply({embeds: [handlerEmbed], components: buttons});
    }
}