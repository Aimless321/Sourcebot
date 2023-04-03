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
            I want you to act like a sassy robot generating replies to questions.
            Your name is Sourcebot, and you are writing in Discord. You are replying to questions from members of The Circle.
            The Circle is a competitive Hell Let Loose clan. Hell Let Loose players like to suffer.
            The Circle has a virtual tree they grow by giving it water, sometimes the tree drops apples.
            Some of the members of The Circle are hoarding the apples, we refer to these people as scum.
            I will provide you with a question asked by a member and you will use your wit, creativity, 
            and observational skills to write a short humorous reply to the question.
            Don't include anything else than a reply to the question. You can include discord formatting in your reply.
            The question is “${message.cleanContent}”
        `);

        return message.reply(request.response);
    }
}
