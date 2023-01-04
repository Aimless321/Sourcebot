const {Event, EventSignup} = require("../models");
const {Op} = require("sequelize");


module.exports = {
    async cleanUpEvents(client) {
        const events = await Event.findAll({
            where: {
                eventDate: {
                    [Op.lt]: new Date(new Date() - 60 * 60 * 1000)
                }
            }
        });

        for (let event of events) {
            console.info(`Cleaing up event ${event.name}`);

            const channel = await client.channels.fetch(event.channelId);
            const message = await channel.messages.fetch(event.messageId);

            if (event.attendeeRole) {
                const role = message.guild.roles.cache.get(event.attendeeRole);
                await message.guild.roles.create({
                    data: {
                        name: role.name,
                        color: role.color,
                        hoist: role.hoist,
                        position: role.position,
                        permissions: role.permissions,
                        mentionable: role.mentionable
                    }
                });
                await role.delete('Emptying role');
            }

            await message.delete();
            await EventSignup.destroy({where: {eventId: event.id}});
            await event.destroy();
        }

    }
};