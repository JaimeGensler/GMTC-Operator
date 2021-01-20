import Discord from 'discord.js';
import BaseBot from './BotAPI';
import {
	Command,
	AuthTM,
	AuthHM,
	AuthPhoneAnswerer,
} from './BotAPI/Decorators';
import { greet, isAre, personPeople } from './utils/text';
import getCommandsForRole from './utils/text/getCommandsForRole';
import Queue from './utils/Queue';
import waitingRoom from './utils/waitingRoom';

export default class OperatorBot extends BaseBot {
	private readonly queue: Queue<string, Discord.GuildMember> = new Queue();
	private readonly status = {
		isActive: false,
		transfersHandled: 0,
	};

	@Command('start')
	@AuthHM
	private startCompetition() {
		this.status.isActive = true;
		super.addListener('voiceStateUpdate', this.watchVoiceState);
		return 'Starting competition.';
	}

	@Command('status')
	@AuthTM
	private getStatus({ member }: Discord.Message) {
		const qL = this.queue.length;
		return `${greet(
			member,
		)} I'm doing great, thanks for asking! Here's what's going on:
		I am currently: **${this.status.isActive ? 'ACTIVE' : 'WAITING TO !START'}.**
		I have handled **${this.status.transfersHandled} transfers.**
		There ${isAre(qL)} currently **${qL} ${personPeople(qL)} in queue.**`;
	}

	@Command('help')
	@AuthPhoneAnswerer
	private getAllCommands({ member }: Discord.Message) {
		return getCommandsForRole(member);
	}

	@Command('phone', 'next', 'answer')
	@AuthPhoneAnswerer
	private answerPhone({ member }: Discord.Message) {
		if (!member) return;
		if (!this.status.isActive) return;
		if (this.queue.length === 0) return 'Nobody in queue right now.';

		const firstInQueue = this.queue.first()!;
		firstInQueue.voice.setChannel(
			member.voice.channelID,
			'Moved to phone room by OperatorBot.',
		);
		return;
	}

	@Command('queue', 'q')
	@AuthPhoneAnswerer
	private getQueueInfo({ content, member }: Discord.Message) {
		if (!this.status.isActive) return;

		const qL = this.queue.length;
		let message = `There ${isAre(qL)} **${qL} ${personPeople(
			qL,
		)}** in queue.`;

		// if (content.includes(' list')) {
		// 	message += '\n';
		// 	message += this.queue
		// 		.map(
		// 			(_, val, i) =>
		// 				`${i + 1} - ${val?.nickname ?? val?.displayName}`,
		// 		)
		// 		.join('\n');
		// }
		return message;
	}

	private watchVoiceState(
		oldState: Discord.VoiceState,
		newState: Discord.VoiceState,
	) {
		const member = oldState.member ?? newState.member;
		if (!member) return;

		if (waitingRoom.didJoin(oldState, newState)) {
			this.queue.enqueue(member.id, member);
		} else if (waitingRoom.didLeave(oldState, newState)) {
			this.queue.dequeue(member.id);
		}
	}
}
