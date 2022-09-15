module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.info(`Ready! Logged in as ${client.user.tag}`);
    },
};