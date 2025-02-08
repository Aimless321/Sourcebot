const {SlashCommandBuilder} = require('discord.js');
const {adminRoleId} = require("../../config.json");
const {getMembersMessageCount} = require("../modules/memberStats.js");

async function generate(interaction) {
    await interaction.deferReply({ephemeral: true});

    const guild = interaction.guild;
    const memberMessages = await getMembersMessageCount(guild);

    let messageContent = "";
    for (const [member, messages] of Object.entries(memberMessages)) {
        messageContent += `**${member.toString()}: ${messages}**\n`;
    }


    return await interaction.editReply({content: `${messageContent}`});
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('inactivity')
        .setDescription('Main command for activity')
        .addSubcommand(subcommand =>
            subcommand
                .setName('generate')
                .setDescription('Generate inactivity report')
        ),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(adminRoleId)) {
            return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
        }

        switch (interaction.options.getSubcommand()) {
            case 'generate':
                return await generate(interaction);
        }

        return interaction.reply({content: 'Invalid command, use one of the subcommands', ephemeral: true});
    },
};
