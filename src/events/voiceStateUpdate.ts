import {VoiceState} from "discord.js";
import {ChannelType} from "discord-api-types/v10";
import {musicBotId} from "../../config.json";
import db from "../models";


async function removeEmptyVC(oldState: VoiceState, newState: VoiceState) {
    const channel = await VC.findByPk(oldState.channelId);
    if (channel === null) {
        return;
    }

    const oldChannel = oldState.channel;
    const numMembers = oldChannel.members.size;
    if (numMembers === 0) {
        await oldChannel.delete();
        await channel.destroy();
    }
}

async function createNewVC(oldState: VoiceState, newState: VoiceState) {
    const {VC, VCGenerator} = db;
    const channel = await VCGenerator.findByPk(newState.channelId);
    if (channel === null) {
        return;
    }

    const owner = oldState.member;

    const vc = await newState.guild.channels.create({
        name: `${owner.displayName}'s channel`,
        parent: channel.parentId,
        type: ChannelType.GuildVoice
    });

    await owner.voice.setChannel(vc);

    const vcModel = VC.build({id: vc.id, owner: owner.id})
    await vcModel.save();
}

async function changeAudioQuality(oldState: VoiceState, newState: VoiceState) {
    const member = oldState.member;
    if (member.id !== musicBotId) {
        return;
    }

    const {VC} = db;
    const channel = await VC.findByPk(newState.channelId);
    if (channel === null) {
        return;
    }

    await newState.channel.setBitrate(384000);
}

export default {
    name: 'voiceStateUpdate',
    async execute(oldState: VoiceState, newState: VoiceState) {
        await removeEmptyVC(oldState, newState);

        if (!newState.channelId) {
            return;
        }

        // Check if its a generator channel and make a new VC if yes
        await createNewVC(oldState, newState);

        await changeAudioQuality(oldState, newState);
    },
};
