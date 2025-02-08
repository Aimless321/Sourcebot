import {threadedChannels} from "../../config.json";
import {Message} from "discord.js";

export default {
    name: 'messageCreate',
    async execute(message: Message) {
        if (!threadedChannels.includes(message.channelId)) {
            return;
        }

        await message.startThread({name: `${message.member?.displayName}'s feedback discussion`});
    },
};
