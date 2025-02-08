const {threadedChannels, aiReplyChannels} = require("../../config.json");
const {replyToMessage} = require("../modules/AIReply");

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if(aiReplyChannels.includes(message.channelId)) {

            return replyToMessage(message);
        }

        if (!threadedChannels.includes(message.channelId)) {
            return;
        }

        await message.startThread({name: `${message.member.displayName}'s feedback discussion`});
    },
};
