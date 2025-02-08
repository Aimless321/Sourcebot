import cron from "node-cron";
import {token} from "../config.json";
import {updateCostOverviews} from "./modules/costs";
import {cleanUpEvents, sendRecruitNotifications, sendSignupReminders} from "./modules/scheduler";
import {Client, GatewayIntentBits} from "discord.js";
import { events } from './events';

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
    if (event.once) {
        // @ts-ignore
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        // @ts-ignore
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(token).then(() => {
    cleanUpEvents(client);
    sendSignupReminders(client);
    sendRecruitNotifications(client);
});

cron.schedule('*/15 * * * *', async () => await updateCostOverviews(client));
cron.schedule('0 * * * *', async () => await cleanUpEvents(client));
cron.schedule('0 * * * *', async () => await sendSignupReminders(client));
cron.schedule('0 * * * *', async () => await sendRecruitNotifications(client));
