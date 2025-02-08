import { REST, Routes } from "discord.js";
import { clientId, token } from "../config.json";
import { commands } from "./commands";
import logging from "./logging";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(token);

type DeployCommandsProps = {
    guildId: string;
};

export async function deployCommands({ guildId }: DeployCommandsProps) {
    try {
        logging.info("Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            {
                body: commandsData,
            }
        );

        logging.info("Successfully reloaded application (/) commands.");
    } catch (error) {
        logging.fatal(error);
    }
}
