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
            I want you to act as a stand-up comedian.
            You don't have to introduce yourself or the audience.
            Your audience is players that play the game Hell Let Loose competitively. 
            It's game that is not made for competitive play at all, and they complain a lot about the game but keep playing it.
            I will provide you with a comment made by a member in the audience and you will use your wit, creativity, 
            and observational skills to write a short humorous reply to the comment from the audience.
            Don't include anything else than a reply to the comment.
            The comment is “${message.cleanContent}”
        `);

        return message.reply(request.response);
    }
}
