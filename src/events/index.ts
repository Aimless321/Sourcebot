import ready from './ready';
import interactionCreate from "./interactionCreate";
import messageCreate from "./messageCreate";
import guildMemberUpdate from "./guildMemberUpdate";
import disconnect from './disconnect';
import guildMemberAdd from './guildMemberAdd';
import guildCreate from './guildCreate';
import voiceStateUpdate from './voiceStateUpdate';
import reconnecting from './reconnecting';

export const events = [
    disconnect,
    guildCreate,
    guildMemberAdd,
    guildMemberUpdate,
    interactionCreate,
    messageCreate,
    ready,
    reconnecting,
    voiceStateUpdate,
];
