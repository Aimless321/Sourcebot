const {feedbackChannel} = require("../config.json");

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.channelId !== feedbackChannel) {
            return;
        }

        await message.startThread({name: `${message.member.displayName}'s feedback discussion`});
    },
};