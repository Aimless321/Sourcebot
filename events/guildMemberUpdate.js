const {RoleNotification} = require("../models");

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

            return newMember.send(JSON.parse(model.message))
        });
    },
};

