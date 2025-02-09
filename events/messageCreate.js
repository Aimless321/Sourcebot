const {threadedChannels} = require("../config.json");

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!threadedChannels.includes(message.channelId)) {
            return;
        }

        await message.startThread({name: `${message.member.displayName}'s feedback discussion`});
    },
};