import {
    CacheType,
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";
import {adminRoleId} from "../../config.json";
import {getMembersMessageCount} from "../modules/memberStats";

async function generate(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    const guild = interaction.guild as Guild;
    const memberMessages = await getMembersMessageCount(guild);

    let messageContent = "";
    for (const [member, messages] of Object.entries(memberMessages)) {
        messageContent += `**${member.toString()}: ${messages}**\n`;
    }


    return await interaction.editReply({content: `${messageContent}`});
}


export const data = new SlashCommandBuilder()
    .setName('inactivity')
    .setDescription('Main command for activity')
    .addSubcommand(subcommand =>
        subcommand
            .setName('generate')
            .setDescription('Generate inactivity report')
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;

    if (!member.roles.cache.has(adminRoleId)) {
        return interaction.reply({
            content: 'You don\'t have permission for this command',
            flags: MessageFlags.Ephemeral
        })
    }

    switch (interaction.options.getSubcommand()) {
        case 'generate':
            return await generate(interaction);
    }

    return interaction.reply({content: 'Invalid command, use one of the subcommands', flags: MessageFlags.Ephemeral});
}
