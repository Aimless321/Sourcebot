const {token} = require("../../config.json");

module.exports = {
    name: 'disconnect',
    async execute(client) {
        console.error(`Bot disconnected, trying to reconnect.`);
        await client.login(token);
    },
};
