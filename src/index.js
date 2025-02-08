const fs = require('node:fs');
const path = require('node:path');
const {Collection} = require('discord.js');
const {token} = require('../config.json');
require('better-logging')(console);
const client = require('../client');
const cron = require("node-cron");
const {updateCostOverviews} = require("./modules/costs");
const {cleanUpEvents, sendSignupReminders, sendRecruitNotifications} = require("./modules/scheduler");

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

client.buttons = new Collection();
const buttonsPath = path.join(__dirname, 'buttons');
const buttonFolders = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFolders) {
    const filePath = path.join(buttonsPath, file);
    const button = require(filePath);

    if (!Array.isArray(button.name)) {
        client.buttons.set(button.name, button);
        continue;
    }

    button.name.forEach(name => client.buttons.set(name, button));
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Login to Discord with your client's token
client.login(token).then(() => {
    cleanUpEvents(client);
    sendSignupReminders(client);
    sendRecruitNotifications(client);
});


cron.schedule('*/15 * * * *', async () => await updateCostOverviews(client));
cron.schedule('0 * * * *', async () => await cleanUpEvents(client));
cron.schedule('0 * * * *', async () => await sendSignupReminders(client));
cron.schedule('0 * * * *', async () => await sendRecruitNotifications(client));
// cron.schedule('0 10 * * *', async () => await scheduledDeploy(client, 'server1'));
