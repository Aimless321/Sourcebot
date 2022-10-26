const {ChannelType} = require("discord-api-types/v10");
const {Collection} = require("discord.js");
const {inactivityRoles} = require("../config.json");

module.exports = {
    async getMembersMessageCount(guild) {
        const channelCache = await guild.channels.fetch();
        const count = {};

        const today = new Date();
        const priorDate = new Date(new Date().setDate(today.getDate() - 30));

        for (const [id, channel] of channelCache) {
            if (channel.type !== ChannelType.GuildText) {
                continue;
            }

            const messages = await channel.messages.fetch();

            messages
                .filter(message => message.createdAt > priorDate)
                .forEach(message => {
                    if (!count[message.member]) {
                        count[message.member] = 1;
                    }

                    count[message.member]++;
                });
        }

        let members = new Collection();
        for (const id of inactivityRoles) {
            const role = await guild.roles.fetch(id);

            members = members.merge(role.members,
                x => ({keep: true, value: x}),
                y => ({keep: true, value: y}),
                (x, y) => ({keep: true, value: x}));
        }

        let userList = {};
        for (const [id, member] of members) {
            let numMessages = count[member];
            if (!numMessages) {
                numMessages = 0;
            }

            userList[member] = numMessages;
        }

        // Return sorted object
        return Object.entries(userList)
            .sort(([, a], [, b]) => a - b)
            .reduce((r, [k, v]) => ({...r, [k]: v}), {});
    }
};