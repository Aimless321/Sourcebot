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
        if (message.author.bot || message.cleanContent.length < 25) {
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
            The Circle Discord is an R rated server.
            The Circle is a competitive Hell Let Loose clan. Hell Let Loose players like to suffer.
            Hell Let Loose includes tanks, artillery, recon and infantry. Medics are not used in competitive play and are useless in Hell Let Loose because a respawn is often quicker.

            There is a new rule that is used in competitive play called the "One Man Arty rule",
            instead of using 3 arty guns there is now only one artillery player that cannot be killed for the entire game.
            Some players say that it's a good rule since it removes some of the cheese, others say that it takes away from the competitiveness of the games.

            The Circle has a virtual tree they grow by giving it water, sometimes the tree drops apples.
            Some of the members of The Circle are hoarding the apples, we refer to these people as scum.
            Blesku is the biggest scum, you can mention him with <@244225525504016394>.

            The name of the official flare bitch of The Circle is Wietspookje, you can mention him with <@365883140046323713>.

            The Circle has a few attack squads, attack 1 is known as the spanish legion, 
            attack 3 is known as the Black Circle Boys and attack 5 is known as the mongolian horde.

            I will provide you with a question asked by a member and you will use your wit, creativity, 
            and observational skills to write a short humorous reply to the question.
            Don't include anything else than a reply to the question. Include discord formatting in your reply.
            The question asked by ${message.author.toString()} is “${message.content}”.
            Reply:
        `);

        return message.reply(request.response);
    },
    async generateRecruitWelcome(name) {
        const {ChatGPTClient} = await import("@waylaidwanderer/chatgpt-api");
        const chatGptClient = new ChatGPTClient(chatGPTApiKey, clientOptions);


        const request = await chatGptClient.sendMessage(
            `
            Generate a funny and wholesome but slightly sassy welcome message for a new recruit of The Circle.
            The Circle is a competitive Hell Let Loose clan. Hell Let Loose players like to suffer.
            Hell Let Loose includes tanks, artillery, recon and infantry. 
            Medics are not used in are useless in Hell Let Loose because a respawn is often quicker.
            
            Recruits have to prove themselves by playing events and joining the voice channels.
            Include that we are a nice bunch of people playing a lot of different games and that they are always welcome to join the voice channels.
            Make sure to encourage them to sign up for events in the channels "<#1009491222219464764>" and "<#1009491362032394250>".

            Our main rule is "Don't be a cunt", make sure they know not to break this rule.
            If they have any questions they can send a message to any of the admins.

            The recruit's name is ${name}.
            
            Welcome message:
        `);

        return request.response;
    },
    async generateMemberWelcome(name) {
        const {ChatGPTClient} = await import("@waylaidwanderer/chatgpt-api");
        const chatGptClient = new ChatGPTClient(chatGPTApiKey, clientOptions);


        const request = await chatGptClient.sendMessage(
            `
            Generate a funny, wholesome and sassy welcome message for a member of The Circle that passed his recruitment period.
            Congratulate him on being accepted as member, and welcome him into the community.
            They have proved themselves worthy of being a member by hanging out in voice chats and playing events with us.
            
            The Circle is a competitive Hell Let Loose clan. Hell Let Loose players like to suffer.
            Hell Let Loose includes tanks, artillery, recon and infantry. 
            They have probably endured a lot of deaths to artillery and tanks during their recruitment period.
            Complement them for sticking around through the suffering.
            
            The members' name is ${name}.
            
            Welcome message:
        `);

        return request.response;
    },
    async generateJoinMessage(name) {
        const {ChatGPTClient} = await import("@waylaidwanderer/chatgpt-api");
        const chatGptClient = new ChatGPTClient(chatGPTApiKey, clientOptions);


        const request = await chatGptClient.sendMessage(
            `
            Generate a funny and sassy welcome message for someone that joined The Circle discord server.
            The Circle is a competitive Hell Let Loose clan competing in multiple tournaments.
            We're playing in Division 1 of the ECL and are also competing in Seasonal in group D.
            
            They haven't joined our clan yet, but could be looking for one.
            They could be a new player to Hell Let Loose or a veteran from a different clan looking for a new home.
            Make sure to let them know that if they wanna join us to look in the channel "<#1027724819770384445>".        
            If they're looking to support us or get a VIP slot they can check the channel "<#1042814723047039116>".
            
            Also make sure they don't forget to water the virtual tree in "<#1009757134910652466>".
            
            Always mention these channels exactly like stated.
            
            The members' name is ${name}.
            If possible make a slightly savage joke with their name.
            
            Welcome message:
        `);

        return request.response;
    }
}
