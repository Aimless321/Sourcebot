const {VC} = require('../models/');
const {CostOverview} = require("../models");
const client = require("../client");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.info(`Ready! Logged in as ${client.user.tag}`);

        const VCs = await VC.findAll();
        let numClean = 0;

        for (const vc of VCs) {
            try {
                await client.channels.fetch(vc.id)
            } catch(e) {
                if (e.rawError.message !== "Unknown Channel") {
                    continue;
                }

                await vc.destroy();
                numClean++;
            }
        }

        console.info(`Cleaned ${numClean} VC models`);


        const overviews = await CostOverview.findAll();

        for (const overview of overviews) {
            let channel;
            try {
                channel = await client.channels.fetch(overview.channelId);
            } catch(e) {
                if (e.rawError.message === "Unknown Channel") {
                    await overview.destroy();
                    continue;
                }
            }

            try {
                await channel.messages.fetch(overview.messageId);
            } catch(e) {
                if (e.rawError.message === "Unknown Message") {
                    await overview.destroy();
                }
            }
        }
    },
};