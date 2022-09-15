module.exports = {
    name: 'debug',
    async execute(msg) {
        console.debug(`DEBUG: ${msg}`);
    },
};