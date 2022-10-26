const {VC} = require('../models/');

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
    },
};