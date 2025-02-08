import {
    Guild,
    Collection,
    GuildMember,
    Message,
} from 'discord.js';
import {inactivityRoles} from '../../config.json';

export async function getMembersMessageCount(guild: Guild): Promise<Record<string, number>> {
    // Fetch all channels
    const channelCache = await guild.channels.fetch();
    const count: Record<string, number> = {};

    // Calculate date range (30 days ago)
    const today = new Date();
    const priorDate = new Date(today);
    priorDate.setDate(today.getDate() - 30);

    // Iterate through channels, only process text-based
    for (const [, channel] of channelCache) {
        if (!channel?.isTextBased()) continue;

        // Fetch messages in this channel
        const messages = await channel.messages.fetch();

        // Filter by messages created after priorDate
        messages
            .filter((msg: Message) => msg.createdAt > priorDate)
            .forEach((msg: Message) => {
                const memberId = msg.member?.id;
                if (!memberId) return;

                // Increment the count for each user
                if (!count[memberId]) {
                    count[memberId] = 1;
                } else {
                    count[memberId]++;
                }
            });
    }

    // Gather members from all inactivity roles
    let members = new Collection<string, GuildMember>();
    for (const roleId of inactivityRoles) {
        const role = await guild.roles.fetch(roleId);
        if (role?.members) {
            // Merge role's members into our big collection
            for (const [memberId, member] of role.members) {
                members.set(memberId, member);
            }
        }
    }

    // Build an object of userId -> messageCount
    const userList: Record<string, number> = {};
    for (const [id, member] of members) {
        userList[id] = count[id] ?? 0;
    }

    // Sort by ascending message count
    const sortedEntries = Object.entries(userList).sort(([, a], [, b]) => a - b);

    // Convert back to an object with sorted keys
    return sortedEntries.reduce<Record<string, number>>((r, [k, v]) => {
        r[k] = v;
        return r;
    }, {});
}
