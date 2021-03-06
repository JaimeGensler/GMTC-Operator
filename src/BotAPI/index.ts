import Discord from 'discord.js';

export default class BaseBot {
	protected readonly _client: Discord.Client = new Discord.Client();
	protected readonly _readyListeners: Array<() => void> = [];

	public constructor(token: string | undefined) {
		this.log('Starting bot.');

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

		if (channel instanceof Discord.TextChannel && content.startsWith('!')) {
			const [command, ...cmdArgs] = content.split(' ');
			if (command in this) {
				//@ts-ignore
				const result: string | undefined = this[command](
					message,
					cmdArgs,
				);

				if (result) {
					this.log(`Received command ${command}. Sent response.`);
					channel.send(result).catch(this.logError);
				} else {
					this.log(`Received command ${command}. No response sent.`);
				}
			}
		}
	}

	protected log(text: string) {
		const timeString = new Date().toString();
		console.log(timeString, '|', text);
	}
	protected logError(e: Error) {
		const timeString = new Date().toString();
		console.error(timeString, '|', e.message);
	}
}
