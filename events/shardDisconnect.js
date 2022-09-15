const {token} = require("../config.json");
const client = require('../client');

module.exports = {
    name: 'shardDisconnect',
    async execute() {
        console.error(`Bot disconnected, trying to reconnect.`);
        client.login(token)
    },
};