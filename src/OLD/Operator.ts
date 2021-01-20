export default {};
// import Discord from 'discord.js';
// import * as dotenv from 'dotenv';

// import Queue from '../utils/Queue';
// import Logger from '../utils/Logger';
// import { BotStatus } from '../BotAPI/types';

// import COMMANDS from '../BotText/COMMANDS.json';
// import MESSAGES from '../BotText/MESSAGES.json';
// import CONFIG from './CONFIG.json';

// dotenv.config();

// export default class Operator {
// 	private readonly client: Discord.Client;
// 	private commandChannel: Discord.TextChannel | undefined;
// 	private readonly queue: Queue<string, Discord.GuildMember> = new Queue();
// 	private transfersHandled = 0;

// 	public constructor() {
// 		this.client = new Discord.Client();

// 		Logger.log('Trying Login...');
// 		this.client
// 			.login(process.env.BOT_TOKEN)
// 			.then(() => Logger.log('Login successful.'))
// 			.catch(e => {
// 				Logger.error(e);
// 				this.client.destroy();
// 			});

// 		this.client.once('ready', this.setup.bind(this));
// 	}
// 	private setup(): void {
// 		Logger.log('OperatorBot ready.');
// 		this.setCommandWatchChannel(CONFIG.PERMITTED_TEXT_CHANNEL);

// 		this.commandChannel?.send(MESSAGES.START_SERVER);
// 		this.setActivity('Trivia!', BotStatus.PLAYING);

// 		this.client.on('message', this.handleStartMessage.bind(this));
// 	}
// 	private handleStartMessage({ content, channel, member }: Discord.Message) {
// 		if (
// 			content === COMMANDS.START_BOT &&
// 			channel.id === this.commandChannel?.id &&
// 			member?.roles.cache.find(r => r.name === CONFIG.REQUIRED_START_ROLE)
// 		) {
// 			this.client.removeAllListeners();
// 			this.sendMessage(MESSAGES.START_BOT);
// 			this.setActivity('the phone lines!', BotStatus.LISTENING);
// 			this.client.on('message', this.watchMessages.bind(this));
// 			this.client.on(
// 				'voiceStateUpdate',
// 				this.watchVoiceChannels.bind(this),
// 			);
// 		}
// 	}
// 	private watchMessages({ content, channel, member }: Discord.Message) {
// 		if (
// 			content === COMMANDS.NEXT_CALLER &&
// 			channel.id === this.commandChannel?.id &&
// 			member?.roles.cache.find(r => r.name === 'Phone Answerer')
// 		) {
// 			// Valid use of NEXT_CALLER command
// 			if (this.queue.isEmpty()) {
// 				this.sendMessage(
// 					':sadYeehaw: Nobody wants to talk right now...',
// 				);
// 			} else {
// 				const [_, firstInQueue] = this.queue.first() ?? ['', undefined];
// 				if (!firstInQueue) return;
// 				firstInQueue.voice
// 					.setChannel(member.voice.channelID, 'Moved by Operator Bot')
// 					.then(() => {
// 						this.dequeue(firstInQueue.id);
// 						Logger.log(
// 							`Moved ${firstInQueue.displayName} (${firstInQueue.id}) to phone room with ${member.displayName} (${member.id}).`,
// 						);
// 					})
// 					.catch(Logger.error);
// 			}
// 		}
// 		if (content === '!DEBUG queue') {
// 			this.sendMessage(this.queue.DEBUG_STRING());
// 		}
// 		if (
// 			content === COMMANDS.STOP_BOT &&
// 			channel.id === this.commandChannel?.id &&
// 			member?.roles.cache.find(r => r.name === CONFIG.REQUIRED_START_ROLE)
// 		) {
// 			this.stop();
// 		}
// 		// TODO: Handle Grace killing bot
// 	}
// 	private watchVoiceChannels(
// 		oldState: Discord.VoiceState,
// 		newState: Discord.VoiceState,
// 	) {
// 		if (
// 			newState.channel?.name === CONFIG.LOBBY_VOICE_CHANNEL &&
// 			(oldState.channel === null ||
// 				oldState.channel.name !== CONFIG.LOBBY_VOICE_CHANNEL)
// 		) {
// 			// JOINED Waiting Room!
// 			if (!newState.member) throw new Error('FUCK');
// 			this.enqueue(newState.member.id, newState.member);
// 		} else if (
// 			oldState.channel?.name === CONFIG.LOBBY_VOICE_CHANNEL &&
// 			(newState.channel === null ||
// 				newState.channel.name !== CONFIG.LOBBY_VOICE_CHANNEL)
// 		) {
// 			if (!newState.member) throw new Error('FUCK');
// 			this.dequeue(newState.member.id);
// 		}
// 	}

// 	private stop() {
// 		this.sendMessage('Thanks for playing!');
// 		this.client.removeAllListeners();
// 	}

// 	// ===== Helpers =====
// 	private enqueue(id: string, member: Discord.GuildMember) {
// 		this.queue.enqueue(id, member);
// 		Logger.log(`Enqueued ${member.displayName} (${member.id}).`);
// 	}
// 	private dequeue(id: string) {
// 		const member = this.queue.dequeue(id);
// 		if (member) {
// 			Logger.log(`Dequeued ${member.displayName} (${member.id}).`);
// 		} else {
// 			Logger.log(`Failed to dequeue (${id}).`);
// 		}
// 	}
// 	private sendMessage(message: string): void {
// 		this.commandChannel
// 			?.send(message)
// 			.then(() => Logger.log(`Sent message: "${message}"`))
// 			.catch(Logger.error);
// 	}
// 	private setActivity(
// 		status: string,
// 		type: BotStatus = BotStatus.PLAYING,
// 	): void {
// 		this.client.user
// 			?.setActivity(status, {
// 				type: type as Discord.ActivityType,
// 			})
// 			.then(() =>
// 				Logger.log(
// 					`Successfuly set activity status to "${type} ... ${status}".`,
// 				),
// 			)
// 			.catch(Logger.error);
// 	}

// 	private setCommandWatchChannel(listenToChannel: string): void {
// 		const foundChannel = this.client.channels.cache.find(
// 			channel =>
// 				channel instanceof Discord.TextChannel &&
// 				channel.name === listenToChannel,
// 		) as Discord.TextChannel | undefined;

// 		if (foundChannel === undefined) {
// 			throw new Error('Could not find text channel to listen to!');
// 		}

// 		this.commandChannel = foundChannel;
// 	}
// }
