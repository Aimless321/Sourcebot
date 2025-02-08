import {BaseInteraction} from "discord.js";
import {commands} from "../commands";

export default {
    name: 'interactionCreate',
    async execute(interaction: BaseInteraction) {
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            if (commands[commandName as keyof typeof commands]) {
                await commands[commandName as keyof typeof commands].execute(interaction);
            }
        }

        // let handler;
        // if (interaction.isButton()) {
        //     handler = interaction.client.buttons.get(interaction.customId);
        // } else if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
        //     handler = interaction.client.commands.get(interaction.commandName);
        // } else {
        //     return;
        // }
        //
        // if (!handler) return;
        //
        // try {
        //     if (interaction.isAutocomplete()) {
        //         await handler.autocomplete(interaction);
        //     } else {
        //         await handler.execute(interaction);
        //     }
        // } catch (error) {
        //     console.error(error);
        //     await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        // }
    },
};