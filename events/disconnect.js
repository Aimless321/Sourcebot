module.exports = {
    name: 'disconnect',
    async execute(client) {
        console.log(`Bot disconnected, exiting.`);
        process.exit(1);
    },
};