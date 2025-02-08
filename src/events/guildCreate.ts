import {Guild} from "discord.js";
import {deployCommands} from "../deploy-commands";

export default {
    name: 'guildCreate',
    async execute(guild: Guild) {
        await deployCommands({ guildId: guild.id });
    },
}