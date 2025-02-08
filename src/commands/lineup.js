const {adminRoleId} = require("../../config.json");
const {codeBlock, SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lineup')
        .setDescription('lineup')
        .addRoleOption(input => input.setName('role').setDescription('Role to dump ids for').setRequired(true))
    ,
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(adminRoleId)) {
            return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
        }

        const role = interaction.options.getRole('role');
        const ids = role.members.map(member => member.id);

        return interaction.reply({content: codeBlock(ids.join('\n'))});
    },
};
