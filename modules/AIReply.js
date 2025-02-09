const { chatGPTApiKey } = require("../config.json");
const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: chatGPTApiKey,
});

const MODEL = 'gpt-4o-mini';
const TEMPERATURE = 1.0;

/**
 * Utility function to call OpenAI Chat Completion with a system + user prompt.
 * This replicates "generateChatCompletion" from your TS code using the official openai package.
 */
async function generateChatCompletion(systemContent, userContent) {
    const response = await openai.chat.completions.create({
        model: MODEL,
        temperature: TEMPERATURE,
        top_p: 0.9,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
        messages: [
            {role: 'system', content: systemContent.trim()},
            {role: 'user', content: userContent.trim()},
        ],
    });

    return response.choices[0]?.message?.content ?? '';
}

module.exports = {
    /**
     * 1) Welcome message for a new recruit of The Circle
     */
    async generateRecruitWelcome(name) {
        const systemMessage = `
You are a comedic, slightly sassy, but wholesome assistant.
Your goal: produce short, playful, irreverent welcome messages for The Circle, 
a competitive Hell Let Loose clan (WWII shooter: 50v50 battles, realistic artillery).
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
