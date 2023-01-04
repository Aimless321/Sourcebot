const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');
const {adminRoleId} = require("../config.json");
const {createNewSignUp} = require("../modules/signup");


async function createSignup(interaction) {
    return await createNewSignUp(interaction);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('signup')
        .setDescription('signup forms and that shit')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create signup form')
        )
    ,
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(adminRoleId)) {
            return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
        }

        switch (interaction.options.getSubcommand()) {
            case 'create':
                return await createSignup(interaction);
        }

        return interaction.reply({content: 'Invalid command, use one of the subcommands', ephemeral: true});
    },
};