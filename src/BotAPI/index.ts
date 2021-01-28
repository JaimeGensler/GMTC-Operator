import Discord, { TextChannel } from 'discord.js';
import * as roles from '../utils/roles';

const IPCChannelID = '803461225266151484';
const watchedChannels = [
	'793337837155647498',
	'799885352327839795',
	'803357368544788500',
];

export default class BaseBot {
	protected readonly _client: Discord.Client = new Discord.Client();
	protected readonly _readyListeners: Array<() => void> = [];

	// Unfortunately this can't be protected as that breaks the Command decorator.
	commands: { [key: string]: string };

	public constructor(token: string | undefined) {
		this.log('Starting bot.');

		// @ts-ignore; The Command decorator sets up the commands object.
		this.commands = this.commands || {};

		this._client
			.login(token)
			.then(() => this.log('Login successful.'))
			.catch(e => {
				this.logError(e);
				this._client.destroy();
			});

		this._client.once('ready', this.start.bind(this));
	}

	public onReady(listener: () => void) {
		this._readyListeners.push(listener.bind(this));
	}

	protected addListener(
		eventType: string,
		listener: (...args: any[]) => void,
	) {
		this._client.addListener(eventType, listener.bind(this));
	}
	protected removeListener(
		eventType: string,
		listener: (...args: any[]) => void,
	) {
		this._client.removeListener(eventType, listener.bind(this));
	}

	private start() {
		this.log('Bot ready.');
		this._readyListeners.forEach(l => l());
		this._client.on('message', this.watchMessages.bind(this));
	}

	private watchMessages(message: Discord.Message) {
		const { channel, content } = message;
		if (!(channel instanceof Discord.TextChannel)) return;

		if (watchedChannels.includes(channel.id)) {
			const isTM =
				roles.isHeadTriviaMaster(message.member) ||
				roles.isTriviaMaster(message.member);
			if (isTM) {
				this.logEvent('tm-message', {
					channel: channel.id,
					author: message.author.id,
					content,
				});
			}
		}

		if (content.startsWith('!')) {
			const [command, ...cmdArgs] = content.split(' ');
			const fn = this.findCommand(command);
			if (fn) {
				Promise.resolve()
					.then(() => fn(message, cmdArgs))
					.then((result: string | undefined) => {
						if (result) {
							this.log(
								`Received command ${command}. Sent response.`,
							);
							channel.send(result).catch(this.logError);
						} else {
							this.log(
								`Received command ${command}. No response sent.`,
							);
						}
					});
			}
		}
	}

	private findCommand(cmd: string): Function | null {
		// Ensure the command we are looking for exists.
		if (!(cmd in this.commands)) return null;
		const fnName = this.commands[cmd];

		// Ensure the function the command maps to exists.
		if (!(fnName in this)) return null;
		// @ts-ignore
		const fn = this[fnName];

		// Ensure the function is actually a function.
		if (typeof fn !== 'function') return null;
		return fn;
	}

	protected log(text: string) {
		const timeString = new Date().toString();
		console.log(timeString, '|', text);
	}
	protected logError(e: Error) {
		const timeString = new Date().toString();
		console.error(timeString, '|', e.message);
	}
	protected async logEvent(name: string, data: any) {
		const channel = await this._client.channels.fetch(IPCChannelID);
		(channel as TextChannel).send(JSON.stringify({ event: name, data }));
	}
}
