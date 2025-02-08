import {token} from "../../config.json";
import {Client} from "discord.js";

export default {
    name: 'disconnect',
    async execute(client: Client) {
        console.error(`Bot disconnected, trying to reconnect.`);
        await client.login(token);
    },
};
