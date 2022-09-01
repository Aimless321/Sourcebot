const {RoleNotification} = require("../models");
const {roleNotificationConfirmationChannel} = require("../config.json");

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache.difference(oldRoles);
        const newIds = newRoles.map(role => role.id);

        const models = await RoleNotification.findAll({
            where: {
                role: newIds
            }
        });

        models.forEach(model => {
            if (!newMember.roles.cache.has(model.role)) {
                return;
            }

            const role = newRoles.get(model.role);
            const channels = newMember.guild.channels.cache;
            const confirmationChannel = channels.get(roleNotificationConfirmationChannel);
            let announcementChannel = channels.get(model.channel);

            newMember.send(JSON.parse(model.message)).then(() => {
                confirmationChannel.send({
                    embeds: [{
                        title: "Succesfully sent role notification",
                        description: `${role.name} notifcation sent to ${newMember.toString()}`,
                        color: 501760
                    }]
                });

                announcementChannel.send({
                    embeds: [{
                        description: `**Welcome ${newMember.toString()} to the ${role.toString()}!**\n\nA fellow connoisseur of rats in bushes and shouting for infantry support has arrived.`,
                        color: 4813784
                    }]
                });
            }).catch(() => {
                confirmationChannel.send({
                    embeds: [{
                        title: "Failed to send role update message",
                        description: `Cannot send message to ${newMember.toString()} for ${roleName}`,
                        color: 16711680
                    }]
                });
            });
        });
    },
};

