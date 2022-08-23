const {RoleNotification} = require("../models");

const NOTIFICATION_CONFIRMATION_CHANNEL_ID = '1011019878091722802';

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

            const channels = newMember.guild.channels.cache;
            const confirmationChannel = channels.get(NOTIFICATION_CONFIRMATION_CHANNEL_ID)
            const roleName = newRoles.get(model.role).name;

            newMember.send(JSON.parse(model.message)).then(() => {
                confirmationChannel.send({
                    embeds: [{
                        title: "Succesfully sent role notification",
                        description: `${roleName} notifcation sent to ${newMember.toString()}`,
                        color: 501760
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

