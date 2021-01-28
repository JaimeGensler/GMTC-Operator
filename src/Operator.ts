import Discord from 'discord.js';
import BaseBot from './BotAPI';
import { Command } from './BotAPI/Decorators';
import { greet, isAre, personPeople } from './utils/text';
import { AuthTM, AuthHeadTM, AuthPhoneAnswerer } from './utils/roles/AuthRoles';
import AuthUser from './utils/AuthUser';
import getCommandsForRole from './utils/text/getCommandsForRole';
import Queue from './utils/Queue';
import waitingRoom from './utils/waitingRoom';
import phoneLine from './utils/phoneLine';

const TriviaGuildID = '772964238376960030';
const HelperBotID = '803028479004114974';
const IPCChannelID = '803461225266151484';

export default class OperatorBot extends BaseBot {
	private readonly queue: Queue<string, Discord.GuildMember> = new Queue();
	private readonly status = {
		transfersHandled: 0,
	};

	public constructor(token: string | undefined) {
		super(token);
		super.addListener('voiceStateUpdate', this.watchVoiceState);
		super.onReady(this.enqueuePlayersInWaitingRoom);
	}

	@Command('reset')
	@AuthHeadTM
	private resetBot(m: Discord.Message) {
		this.status.transfersHandled = 0;
		this.queue.empty();
		this.clearWaitingRoom(m);
		this.logQueue();
	}

	@Command('status')
	@AuthTM
	private getStatus({ member }: Pick<Discord.Message, 'member'>) {
		const transfers = this.status.transfersHandled;
		return `${greet(
			member,
		)} I'm doing great, thanks for asking! Here's what's going on:
		I have handled **${transfers} transfers.** ${this.queueStatus()}`;
	}

	@Command('help')
	@AuthPhoneAnswerer
	private getAllCommands({ member }: Pick<Discord.Message, 'member'>) {
		return getCommandsForRole(member);
	}

	@Command('phone', 'next', 'answer')
	@AuthPhoneAnswerer
	private answerPhone({ member }: Pick<Discord.Message, 'member'>) {
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

	@Command('hangup', 'hup', 'hu')
	@AuthPhoneAnswerer
	private hangUp({ member }: Pick<Discord.Message, 'member'>) {
		if (!member) return;
		if (
			!member.voice.channel ||
			!/^Phone \d\d?$/.test(member.voice.channel.name)
		) {
			return 'Sorry! You need to be in a phone room to use that command.';
		}

		const caller = member.voice.channel.members.find(
			m => m.id !== member.id,
		);
		if (!caller) {
			return 'There is nobody on the line right now!';
		}

		caller.voice
			.setChannel(
				null,
				`Hung up by ${member.nickname ?? member.displayName}`,
			)
			.catch(this.logError);

		return `Disconnected ${caller.nickname ?? caller.displayName}.`;
	}

	@Command('queue', 'q')
	@AuthPhoneAnswerer
	private getQueueInfo(_: any, args: string[]) {
		if (args.includes('list') || args.includes('li')) {
			return this.getQueueInfoShorthand();
		} else {
			return this.queueStatus();
		}
	}

	@Command('qlist')
	@AuthPhoneAnswerer
	private getQueueInfoShorthand() {
		const response = [this.queueStatus()];
		this.queue.forEach(([, member], i) => {
			response.push(
				`${i + 1} - ${member.nickname ?? member.displayName}`,
			);
		});
		return response.join('\n');
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

	@Command('su')
	@AuthUser(HelperBotID)
	private async su(message: Discord.Message, args: string[]) {
		if (args.length < 2) return;

		const [cmd, userid, ...cmdArgs] = args;

		const guild = await this._client.guilds.fetch(TriviaGuildID);
		if (!guild) return;

		const member = await guild.members.fetch(userid);
		if (!member) return;

		let msg: string | undefined;
		switch (cmd) {
			case 'next':
				msg = this.answerPhone({ member });
				break;
			case 'hup':
				msg = this.hangUp({ member });
				break;
			default:
				msg = `Invalid command ${cmd}`;
		}

		// Encode the output for easier parsing later.
		return JSON.stringify({ src: message.id, userid, msg });
	}

	private queueStatus() {
		const qL = this.queue.length;
		return `There ${isAre(qL)} currently **${qL} ${personPeople(
			qL,
		)}** in the queue.`;
	}

	private watchVoiceState(
		oldState: Discord.VoiceState,
		newState: Discord.VoiceState,
	) {
		const member = oldState.member ?? newState.member;
		if (!member) return;

		if (waitingRoom.didJoin(oldState, newState)) {
			this.queue.enqueue(member.id, member);
			this.logQueue();
		} else if (waitingRoom.didLeave(oldState, newState)) {
			this.queue.dequeue(member.id);
			this.logQueue();
		}

		if (phoneLine.didLeave(oldState, newState)) {
			const user = newState.id;
			const connected = oldState.channel!.members.map(m => m.id);
			this.logEvent('phone-disconnected', { user, connected });
		}
		// Can't use `else if` because these two events are not mutually exclusive:
		// a user could technically go from one phone line to another.
		if (phoneLine.didJoin(oldState, newState)) {
			const user = newState.id;
			const connected = newState.channel!.members.map(m => m.id);
			this.logEvent('phone-connected', { user, connected });
		}
	}

	private async logQueue() {
		const q: string[] = [];
		this.queue.forEach(([id]) => q.push(id));
		await this.logEvent('queue-update', q);
	}

	private enqueuePlayersInWaitingRoom() {
		const gmtcGuild = this._client.guilds.cache.find(
			guild => guild.id === TriviaGuildID,
		);
		if (!gmtcGuild) {
			this.log('Could not find GMTC Guild at bot startup!');
			return;
		}
		const waitingRoom = gmtcGuild.channels.cache.find(
			channel =>
				channel instanceof Discord.VoiceChannel &&
				channel.name === 'WAITING ROOM',
		) as Discord.VoiceChannel | undefined;
		if (!waitingRoom) {
			this.log(
				'Could not find "Waiting Room" channel to enqueue players at bot startup!',
			);
			return;
		}
		this.log(
			`Found GMTC Guild and Waiting Room. Enqueueing ${waitingRoom.members.size} players.`,
		);
		waitingRoom.members.forEach(member => {
			this.queue.enqueue(member.id, member);
		});
		this.logQueue();
	}
}
