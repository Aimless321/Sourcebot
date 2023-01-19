const {
    SlashCommandBuilder,
    EmbedBuilder, time,
} = require('discord.js');
const {adminRoleId} = require("../config.json");
const {Recruit} = require("../models");

async function listRecruits(interaction) {
    const recruits = await Recruit.findAll();

    let recruitString = "";
    for (const recruit of recruits) {
        try {
            const user = await interaction.guild.members.fetch(recruit.discordId);
            recruitString += `${recruit.id}. ${user.toString()}: ${time(recruit.periodStart, 'D')} - ${time(recruit.periodEnd, 'D')}\n`;
        } catch (e) {
            recruitString += `${recruit.id}. ${recruit.discordId}: user left the discord\n`;
        }
    }

    const embed = new EmbedBuilder()
        .setColor(0x3447003)
        .setTitle("All tracked recruits")
        .setFields(
            {
                name: 'List',
                value: recruitString
            }
        );


    return await interaction.reply({ephemeral: true, embeds: [embed]})
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recruits')
        .setDescription('recruit tracking')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Get an overview of all tracked recruits')
        )
    ,
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(adminRoleId)) {
            return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
        }

        switch (interaction.options.getSubcommand()) {
            case 'list':
                return await listRecruits(interaction);

        }

        return interaction.reply({content: 'Invalid command, use one of the subcommands', ephemeral: true});
    },
};