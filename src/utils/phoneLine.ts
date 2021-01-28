import { VoiceState } from 'discord.js';

const phoneRegex = /^Phone \d\d?$/;

function isVoice(s: VoiceState): boolean {
	return !!s.channel && phoneRegex.test(s.channel.name);
}
function movedChannel(s1: VoiceState, s2: VoiceState): boolean {
	return s1.channel?.name !== s2.channel?.name;
}

function didJoin(oldState: VoiceState, newState: VoiceState): boolean {
	return movedChannel(oldState, newState) && isVoice(newState);
}
function didLeave(oldState: VoiceState, newState: VoiceState): boolean {
	return movedChannel(oldState, newState) && isVoice(oldState);
}

export default { didJoin, didLeave };
