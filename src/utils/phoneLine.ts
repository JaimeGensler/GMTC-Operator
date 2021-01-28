import { VoiceState } from 'discord.js';

const phoneRegex = /^Phone \d\d?$/;

function isPhoneRoom(s: VoiceState): boolean {
	return !!s.channel && phoneRegex.test(s.channel.name);
}
function movedChannel(s1: VoiceState, s2: VoiceState): boolean {
	return s1.channel?.name !== s2.channel?.name;
}

function didJoin(oldState: VoiceState, newState: VoiceState): boolean {
	return movedChannel(oldState, newState) && isPhoneRoom(newState);
}
function didLeave(oldState: VoiceState, newState: VoiceState): boolean {
	return movedChannel(oldState, newState) && isPhoneRoom(oldState);
}

export default { didJoin, didLeave };
