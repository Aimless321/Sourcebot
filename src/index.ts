import cron from "node-cron";
import {token} from "../config.json";
import {updateCostOverviews} from "./modules/costs";
import {cleanUpEvents, sendRecruitNotifications, sendSignupReminders} from "./modules/scheduler";
import {Client, GatewayIntentBits} from "discord.js";
import {events} from './events';
import logging from "./logging";
import "dotenv/config";
import {drizzle} from "drizzle-orm/libsql";
import {migrate} from "drizzle-orm/libsql/migrator";

const db = drizzle({connection: process.env.DB_FILE_NAME!, casing: 'snake_case'});
await migrate(db, {
    migrationsFolder: './migrations',
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

for (const event of events) {
    // @ts-ignore
    if (event?.once) {
        // @ts-ignore
        client.once(event.name, (...args) => {
            try {
                // @ts-ignore
                event.execute(...args)
            } catch (e) {
                logging.fatal(e);
            }
        });
    } else {
        // @ts-ignore
        client.on(event.name, (...args) => {
            try {
                // @ts-ignore
                event.execute(...args)
            } catch (e) {
                logging.fatal(e);
            }
        });
    }
}

client.login(token).then(async () => {
    await cleanUpEvents(client);
    await sendSignupReminders(client);
    await sendRecruitNotifications(client);
});

cron.schedule('*/15 * * * *', async () => await updateCostOverviews(client));
cron.schedule('0 * * * *', async () => await cleanUpEvents(client));
cron.schedule('0 * * * *', async () => await sendSignupReminders(client));
cron.schedule('0 * * * *', async () => await sendRecruitNotifications(client));
