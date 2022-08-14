const {VCGenerator, VC} = require('../models/');
const {ChannelType} = require("discord-api-types/v10");

async function removeEmptyVC(oldState, newState) {
    const channel = await VC.findByPk(oldState.channelId);
    if (channel === null) {
        return;
    }

    const oldChannel = oldState.channel;
    const numMembers = oldChannel.members.size;
    if (numMembers === 0) {
        oldChannel.delete();
    }
}

async function createNewVC(oldState, newState) {
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

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        await removeEmptyVC(oldState, newState);

        if (!newState.channelId) {
            return;
        }

        // Check if its a generator channel and make a new VC if yes
        await createNewVC(oldState, newState);
    },
};