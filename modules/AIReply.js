const {chatGPTApiKey} = require("../config.json");
const nlp = require('compromise');

const clientOptions = {
    modelOptions: {
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
    },
    debug: false,
};


module.exports = {
    async replyToMessage(message) {
        if (message.author.bot || message.cleanContent.length < 35) {
            return;
        }

        const containsQuestion = nlp(message.cleanContent).questions().data().length > 0;
        if (!containsQuestion) {
            return;
        }

        console.log(message.cleanContent)

        const {ChatGPTClient} = await import("@waylaidwanderer/chatgpt-api");
        const chatGptClient = new ChatGPTClient(chatGPTApiKey, clientOptions);


        const request = await chatGptClient.sendMessage(
            `
            You are a speaker at The Circle.
            The Circle is a competitive Hell Let Loose clan. Hell Let Loose players like to suffer.
            I will provide you with a question asked by a member and you will use your wit, creativity, 
            and observational skills to write a short humorous reply to the question from the audience.
            Don't include anything else than a reply to the question.
            The question is “${message.cleanContent}”
        `);

        return message.reply(request.response);
    }
}
