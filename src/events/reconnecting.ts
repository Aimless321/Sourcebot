import logging from "../logging";

export default {
    name: 'reconnecting',
    async execute() {
        logging.warn(`Reconnecting to discord`);
    },
};