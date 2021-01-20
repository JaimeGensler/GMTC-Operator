import Discord from 'discord.js';
import Logger from '../utils/Logger';

export default class BaseBot {
	private readonly _client: Discord.Client = new Discord.Client();

	public constructor(token: string | undefined) {
		Logger.log('Starting bot.');

		this._client
			.login(token)
			.then(() => Logger.log('Login successful.'))
			.catch(e => {
				Logger.error(e);
				this._client.destroy();
			});

		this._client.once('ready', this.start.bind(this));
	}

	protected addListener(
		eventType: string,
		listener: (...args: any[]) => void,
	) {
		this._client.on(eventType, listener.bind(this));
	}

	private start() {
		Logger.log('Bot ready.');
		const DEBUG_startup = this._client.channels.cache.find(
			ch => ch instanceof Discord.TextChannel && ch.name === 'operator',
		) as Discord.TextChannel;
		DEBUG_startup.send('DEBUG --- Bot started.');

		this._client.on('message', this.watchMessages.bind(this));
	}

	private watchMessages(message: Discord.Message) {
		const { channel, content } = message;
		if (channel instanceof Discord.TextChannel && content.startsWith('!')) {
			if (content in this) {
				Logger.log(`Received command ${content}. Attempting dispatch:`);
				//@ts-ignore
				const result: string | undefined = this[content](message);
				if (result) {
					Logger.log('Success.');
					channel
						.send(result)
						.then(() => Logger.log(`Sent response message.`))
						.catch(Logger.error);
				} else {
					Logger.log('Failed.');
				}
			}
		}
	}
}
