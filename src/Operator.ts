import Discord from 'discord.js';
import BaseBot from './BotAPI';
import { Command, Pseudonym } from './BotAPI/Decorators';
import { greet, isAre, personPeople } from './utils/text';
import { AuthTM, AuthHeadTM, AuthPhoneAnswerer } from './utils/roles/AuthRoles';
import getCommandsForRole from './utils/text/getCommandsForRole';
import Queue from './utils/Queue';
import waitingRoom from './utils/waitingRoom';

export default class OperatorBot extends BaseBot {
	private readonly queue: Queue<string, Discord.GuildMember> = new Queue();
	private readonly status = {
		transfersHandled: 0,
	};

	public constructor(token: string | undefined) {
		super(token);
		super.addListener('voiceStateUpdate', this.watchVoiceState);
	}

	@Command('reset')
	@AuthHeadTM
	private resetBot(m: Discord.Message) {
		this.status.transfersHandled = 0;
		this.queue.empty();
		this.clearWaitingRoom(m);
	}

	@Command('status')
	@AuthTM
	private getStatus({ member }: Discord.Message) {
		const qL = this.queue.length;
		return `${greet(
			member,
		)} I'm doing great, thanks for asking! Here's what's going on:
		I have handled **${this.status.transfersHandled} transfers.**
		There ${isAre(qL)} currently **${qL} ${personPeople(qL)} in queue.**`;
	}

	@Command('help')
	@AuthPhoneAnswerer
	private getAllCommands({ member }: Discord.Message) {
		return getCommandsForRole(member);
	}

	@Command('phone')
	@Pseudonym('next', 'answer')
	@AuthPhoneAnswerer
	private answerPhone({ member }: Discord.Message) {
		if (!member) return;
		if (this.queue.length === 0) return 'Nobody in queue right now!';
		if (
			!member.voice.channel ||
			!/^Phone \d\d?$/.test(member.voice.channel.name)
		) {
			return 'Sorry! You need to be in a phone room to use that command.';
		}
		if (member.voice.channel.full) {
			return 'Sorry! Your phone line is in use right now!';
		}

		const firstInQueue = this.queue.first()!;
		this.log(`Connecting player to ${member.voice.channel.name}.`);
		firstInQueue.voice
			.setChannel(
				member.voice.channelID,
				'Moved to phone room by OperatorBot.',
			)
			.catch(this.logError);
		this.status.transfersHandled++;

		return `Connecting ${
			firstInQueue.nickname ?? firstInQueue.displayName
		} to ${member.voice.channel.name}.`;
	}

	@Command('queue')
	@Pseudonym('q')
	@AuthPhoneAnswerer
	private getQueueInfo(_: any, args: string[]) {
		const qL = this.queue.length;
		const response = [
			`There ${isAre(qL)} **${qL} ${personPeople(qL)}** in queue.`,
		];
		if (qL > 0 && (args.includes('list') || args.includes('li'))) {
			this.queue.forEach(([, member], i) => {
				response.push(
					`${i + 1} - ${member.nickname ?? member.displayName}`,
				);
			});
		}

		return response.join('\n');
	}

	@Command('qlist')
	private getQueueInfoShorthand(message: Discord.Message) {
		this.getQueueInfo(message, ['list']);
	}

	@Command('clear')
	@AuthTM
	private clearWaitingRoom(message: Discord.Message) {
		if (!message.guild) return;

		const waitingRoom = message.guild.channels.cache.find(
			channel =>
				channel instanceof Discord.VoiceChannel &&
				channel.name === 'WAITING ROOM',
		) as Discord.VoiceChannel | undefined;
		if (!waitingRoom) {
			return "Uh oh! Stinky! I couldn't find the waiting room :(";
		}
		waitingRoom.members.forEach(member =>
			member.voice
				.setChannel(null, 'Waiting Room cleared by Operator.')
				.catch(this.logError),
		);
		return 'Cleared waiting room!';
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
