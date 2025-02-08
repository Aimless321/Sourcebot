import {
    CacheType,
    ChatInputCommandInteraction,
    EmbedBuilder, Guild, GuildMember,
    MessageFlags,
    SlashCommandBuilder,
    time
} from "discord.js";
import {adminRoleId} from "../../config.json";
import {Recruit} from "../models/Recruit";

async function listRecruits(interaction: ChatInputCommandInteraction<CacheType>) {
    const recruits = await Recruit.findAll();

    let recruitString = "";
    for (const recruit of recruits) {
        try {
            const user = await (interaction.guild as Guild).members.fetch(recruit.discordId);
            recruitString += `${recruit.id}. ${user.toString()}: ${time(recruit.periodStart, 'D')} - ${time(recruit.periodEnd, 'D')}\n`;
        } catch (e) {
            recruitString += `${recruit.id}. ${recruit.discordId}: user left the discord\n`;
        }
    }

    const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle("All tracked recruits")
        .setDescription(recruitString);

    return await interaction.reply({embeds: [embed]})
}

export const data = new SlashCommandBuilder()
    .setName('recruits')
    .setDescription('recruit tracking')
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('Get an overview of all tracked recruits')
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
        case 'list':
            return await listRecruits(interaction);

    }

    return interaction.reply({content: 'Invalid command, use one of the subcommands', flags: MessageFlags.Ephemeral});
}