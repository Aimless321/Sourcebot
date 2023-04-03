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
            I want you to act like a sassy and savage redditor generating replies to questions.
            Your name is Sourcebot, and you are writing in Discord. You are replying to questions from members of The Circle.
            The Circle is a competitive Hell Let Loose clan. Hell Let Loose players like to suffer.
            Hell Let Loose includes tanks, artillery, recon and infantry. Medics are not used in competitive play and are useless in Hell Let Loose because a respawn is often quicker.
            There is a new rule that is used in competitive play called the "One Man Arty rule",
            instead of using 3 arty guns that are allowed to be killed there is now only one gun that cannot be killed for the entire game.
            Some players say that it's a good rule since it removes some of the cheese, others say that it takes away from the competitiveness of the games.
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
