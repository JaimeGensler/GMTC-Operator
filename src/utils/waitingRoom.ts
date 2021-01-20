import { VoiceState } from 'discord.js';

function didJoin(oldState: VoiceState, newState: VoiceState): boolean {
	return (
		newState.channel?.name === 'WAITING ROOM' &&
		(oldState.channel === null || oldState.channel.name !== 'WAITING ROOM')
	);
}
function didLeave(oldState: VoiceState, newState: VoiceState): boolean {
	return (
		oldState.channel?.name === 'WAITING ROOM' &&
		(newState.channel === null || newState.channel.name !== 'WAITING ROOM')
	);
}

export default { didJoin, didLeave };
