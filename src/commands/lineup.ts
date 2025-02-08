import {ChatInputCommandInteraction, codeBlock, GuildMember, MessageFlags, Role, SlashCommandBuilder} from "discord.js";
import {adminRoleId} from "../../config.json";

export const data = new SlashCommandBuilder()
    .setName('lineup')
    .setDescription('lineup')
    .addRoleOption(input => input.setName('role').setDescription('Role to dump ids for').setRequired(true))

export async function execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;

    if (!member.roles.cache.has(adminRoleId)) {
        return interaction.reply({
            content: 'You don\'t have permission for this command',
            flags: MessageFlags.Ephemeral
        })
    }

    const role = interaction.options.getRole('role');
    if (!role) {
        return interaction.reply({content: 'Invalid role', flags: MessageFlags.Ephemeral});
    }

    const ids = (role as Role).members.map(member => member.id);

    return interaction.reply({content: codeBlock(ids.join('\n'))});
}

