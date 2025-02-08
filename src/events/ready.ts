import db from "../models"; // <--- The default export from models/index
import {Client} from "discord.js";
import logging from "../logging";

export default {
    name: 'ready',
    once: true,
    async execute(client: Client) {
        logging.info(`Ready! Logged in as ${client.user?.tag}`);

        const {VC, CostOverview} = db;

        const VCs = await VC.findAll();
        let numClean = 0;

        for (const vc of VCs) {
            try {
                await client.channels.fetch(vc.id);
            } catch (e: any) {
                if (e.rawError?.message !== "Unknown Channel") {
                    continue;
                }
                await vc.destroy();
                numClean++;
            }
        }

        logging.info(`Cleaned ${numClean} VC models`);

        const overviews = await CostOverview.findAll();
        for (const overview of overviews) {
            let channel;
            try {
                channel = await client.channels.fetch(overview.channelId);
            } catch (e: any) {
                if (e.rawError?.message === "Unknown Channel") {
                    await overview.destroy();
                    continue;
                }

                logging.error(e);
            }

            if (!channel || !channel.isTextBased()) continue;

            try {
                await channel.messages.fetch(overview.messageId);
            } catch (e: any) {
                if (e.rawError?.message === "Unknown Message") {
                    await overview.destroy();
                    continue;
                }

                logging.error(e);
            }
        }
    },
};
