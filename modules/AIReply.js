const { chatGPTApiKey } = require("../config.json");
const nlp = require('compromise');
// Import ChatGPTClient from the old library:
const { ChatGPTClient } = require("@waylaidwanderer/chatgpt-api");

//
// You can tweak these model options to match your new code's parameters:
// e.g., "gpt-4o-mini" if you have access, or "gpt-3.5-turbo", etc.
//
const clientOptions = {
    modelOptions: {
        model: "gpt-4o-mini",       // Or "gpt-3.5-turbo", etc.
        temperature: 1.0,
        top_p: 0.9,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
    },
    debug: false,
};

/**
 * Utility backport function: replicate the new "generateChatCompletion"
 * approach, but using the old library’s sendMessage call.
 */
async function generateChatCompletion(systemContent, userContent) {
    const chatGptClient = new ChatGPTClient(chatGPTApiKey, clientOptions);

    // In @waylaidwanderer/chatgpt-api, you can pass system prompts using the second argument:
    const response = await chatGptClient.sendMessage(userContent.trim(), {
        systemMessage: systemContent.trim(),
        // The library will handle calling the model with these completion params:
        completionParams: {
            temperature: 1.0,
            top_p: 0.9,
            presence_penalty: 0.6,
            frequency_penalty: 0.3,
            // If you want to override or confirm the model:
            model: "gpt-4o-mini",
        },
    });

    return response.response || "";
}

module.exports = {
    /**
     * Example message reply function (unchanged from your original code).
     * If you still use this, keep it. Otherwise, remove or adapt as needed.
     */
    async replyToMessage(message) {
        if (message.author.bot || message.cleanContent.length < 25) {
            return;
        }

        const containsQuestion = nlp(message.cleanContent).questions().data().length > 0;
        if (!containsQuestion) {
            return;
        }

        console.log(message.cleanContent);

        // Use the old library to send a single prompt that includes a system-style context at the top:
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
      The question asked by ${message.author.toString()} is “${message.cleanContent}”.

      Reply:
      `
        );

        return message.reply(request.response);
    },

    /**
     * 1) Welcome message for a new recruit of The Circle
     */
    async generateRecruitWelcome(name) {
        const systemMessage = `
You are a comedic, slightly sassy, but wholesome assistant.
Your goal: produce short, playful, irreverent welcome messages for The Circle, 
a competitive Hell Let Loose clan (WWII shooter with 50v50 battles, realistic artillery, and no-nonsense warfare).
ALWAYS vary your style, references, tone, structure, and jokes so that consecutive messages are unique:
- Use synonyms, pop-culture references, comedic disclaimers, or historical humor
- Poke fun at the horrors of artillery, tank ambushes, and the clan’s perpetual suffering in the trenches
- The clan’s golden rule is “Don’t be a cunt”
- Tell them to pick social roles in "<#1009259370145660988>", and comp roles in "<#1308787915257810994>"
- Signups for comp matches in "<#1092443108974796820>"
- Check out weekly events in "<#1295436920117133394>" and "<#1296219105765888021>"

Be sure it’s funny, fresh, and unique each time.
    `;

        const userMessage = `
A new recruit named ${name} just joined.
Write a comedic, supportive welcome, reminding them of the big rule,
and encourage them to sign up for events, choose roles, and use voice channels.
    `;

        return generateChatCompletion(systemMessage, userMessage);
    },

    /**
     * 2) Welcome message for someone who just passed the recruitment period
     */
    async generateMemberWelcome(name) {
        const systemMessage = `
You are a comedic, sassy, but warm assistant.
You produce short, playful, irreverent welcome messages for members who just finished recruitment.
ALWAYS vary your style, references, and jokes from one request to the next:
- The Circle is a Hell Let Loose clan (WWII shooter: 50v50, tanks, artillery, realistic bloodshed)
- They survive insane artillery barrages, tank ambushes, and chaotic voice comms 
- They must have thick skin, comedic spirit, and a love for friendly banter
- Congratulate them for enduring the madness and truly earning their place

Inject comedic disclaimers, random pop-culture references, and historical jabs for variety.
    `;

        const userMessage = `
${name} passed recruitment!
Write a comedic, varied, short message congratulating them for surviving 
artillery, tanks, and voice chat chaos, and officially welcoming them.
    `;

        return generateChatCompletion(systemMessage, userMessage);
    },

    /**
     * 3) Welcome message for someone who just joined The Circle Discord (not a recruit yet).
     */
    async generateJoinMessage(name) {
        const systemMessage = `
You are a comedic, slightly sassy, but wholesome assistant.
You produce short, playful, and somewhat irreverent welcome messages for The Circle, 
a competitive Hell Let Loose clan active in tournaments (ECL Division 1, Seasonal group D).
They might be brand-new to Hell Let Loose or a battle-hardened WWII buff, but not yet a recruit.
ALWAYS vary your style, references, and comedic twists so repeated usage stays fresh:
- Encourage them to check "<#1027724819770384445>" if they want to join the clan
- If they’re looking to support or get VIP, direct them to "<#1042814723047039116>"
- Remind them to water the virtual tree in "<#1009757134910652466>"
- Feel free to poke fun at their name in a good-natured way

Mention that Hell Let Loose is a raw, unforgiving WWII shooter where medics and artillery 
often overshadow personal safety, but keep it funny, not grim.
    `;

        const userMessage = `
${name} just joined the Discord server.
They’re not a recruit, but might be interested in The Circle. 
Give them an amusing, friendly welcome with a playful joke about their name.
    `;

        return generateChatCompletion(systemMessage, userMessage);
    }
};
