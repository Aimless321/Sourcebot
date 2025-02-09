import {Op} from "sequelize";
import {recruitmentAdminChannel} from "../../config.json";
import {Client, EmbedBuilder} from "discord.js";
import {removeSignUpForm, sendRemindersForEvent} from "./signup";
import {Event} from "../models/Event";
import {Recruit} from "../models/Recruit";

export async function sendSignupReminders(client: Client) {
    const events = await Event.findAll();

    for (let event of events) {
        // @ts-ignore
        const hoursTillEvent = Math.floor(((event.eventDate - new Date()) / (1000 * 60 * 60)) - .6);

        if (hoursTillEvent !== 5 * 24 && hoursTillEvent !== 3 * 24 && hoursTillEvent !== 24) {
            continue;
        }

        await sendRemindersForEvent(client, event, hoursTillEvent);
    }
}

export async function cleanUpEvents(client: Client) {

    const events = await Event.findAll({
        where: {
            eventDate: {
                // @ts-ignore
                [Op.lt]: new Date(new Date() - 60 * 60 * 1000)
            }
        }
    });

    for (let event of events) {
        console.info(`Cleaning up event ${event.name}`);

        await removeSignUpForm(event, client);
    }
}

export async function sendRecruitNotifications(client: Client) {
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

        // @ts-ignore
        const guild = await client.guilds.fetch(recruit.guildId);

        try {
            const member = await guild.members.fetch(recruit.discordId);

            console.info(`Recruitment period ended for ${member.displayName}`);
            embed.setDescription(`1 month has passed since the promotion of ${member.toString()}`);

            const adminChannel = await guild.channels.fetch(recruitmentAdminChannel);
            // @ts-ignore
            await adminChannel.send({embeds: [embed]});

            recruit.notificationSent = true;
            await recruit.save();
        } catch (e) {
            await recruit.destroy();
        }
    }
}
