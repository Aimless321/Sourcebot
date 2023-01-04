const {Event, Recruit} = require("../models");
const {Op} = require("sequelize");
const {
    mandatorySignupRole,
    roleNotificationConfirmationChannel,
    recruitmentAdminChannel,
    recruitmentAdminRoleId
} = require("../config.json");
const {EmbedBuilder, time, roleMention} = require("discord.js");
const {removeSignUpForm} = require("./signup");

module.exports = {
    async sendSignupReminders(client) {
        const events = await Event.findAll();

        for (let event of events) {
            const hoursTillEvent = Math.floor(((event.eventDate - new Date()) / (1000 * 60 * 60)) - .6);

            if (hoursTillEvent !== 3 * 24 && hoursTillEvent !== 2 * 24 && hoursTillEvent !== 24) {
                continue;
            }

            const repliedBy = (await event.getEventSignups()).map(signup => signup.discordId);
            const channel = await client.channels.fetch(event.channelId);
            const message = await channel.messages.fetch(event.messageId);
            const mandatoryRole = await channel.guild.roles.fetch(mandatorySignupRole, {force: true});
            const members = mandatoryRole.members;

            const embed = new EmbedBuilder()
                .setTitle('The Circle - Signup reminder')
                .setDescription(`
                    We ask all of our comp members to reply to all matches, even if you can't make it to the event.
                    
                    Please reply to [${event.name}](${message.url}) - ${time(event.eventDate, 'F')}`
                );

            let remindersSent = 0;
            members.forEach(member => {
                if (repliedBy.includes(member.id) || member.user.bot) {
                    return;
                }

                member.send({embeds: [embed]}).then(() => {
                    remindersSent++;
                }).catch(() => {
                    console.error('Cannot send DM to', member.displayName);
                });
            });

            const confirmationChannel = client.channels.fetch(roleNotificationConfirmationChannel);
            confirmationChannel.send({
                embeds: [{
                    title: "Sent sign up reminders",
                    description: `${remindersSent} reminders sent for ${event.name} (${hoursTillEvent} hours till event)`,
                    color: 501760
                }]
            });
        }
    },
    async cleanUpEvents(client) {
        const events = await Event.findAll({
            where: {
                eventDate: {
                    [Op.lt]: new Date(new Date() - 60 * 60 * 1000)
                }
            }
        });

        for (let event of events) {
            console.info(`Cleaning up event ${event.name}`);

            await removeSignUpForm(event, client);
        }
    },
    async sendRecruitNotifications(client) {
        const recruits = await Recruit.findAll({
            where: {
                periodEnd: {
                    [Op.lte]: new Date()
                }
            }
        });

        const embed = new EmbedBuilder()
            .setTitle(`Recruitment period expired`)
            .setColor(0xF1C40F)

        for (let recruit of recruits) {
            if (recruit.notificationSent) {
                continue;
            }

            const guild = await client.guilds.fetch(recruit.guildId);
            const member = await guild.members.fetch(recruit.discordId);

            console.info(`Recruitment period ended for ${member.displayName}`);
            embed.setDescription(`1 month has passed since the promotion of ${member.toString()}`);

            const adminChannel = await guild.channels.fetch(recruitmentAdminChannel);
            await adminChannel.send({embeds: [embed], content: roleMention(recruitmentAdminRoleId)});

            recruit.notificationSent = true;
            await recruit.save();
        }
    }
};