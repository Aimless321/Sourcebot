module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        let handler;
        if (interaction.isButton()) {
            handler = interaction.client.buttons.get(interaction.customId);
        } else if (interaction.isChatInputCommand()) {
            handler = interaction.client.commands.get(interaction.commandName);
        } else {
            return;
        }

        if (!handler) return;

        try {
            await handler.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
    },
};