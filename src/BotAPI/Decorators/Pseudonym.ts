import Discord from 'discord.js';
import BotBase from '..';

// Instance Method Decorator
export default function Pseudonym(...pseudonyms: string[]) {
	return function (
		prototype: any,
		methodName: string,
		descriptor: PropertyDescriptor,
	) {
		if (!(prototype instanceof BotBase)) {
			throw new Error();
		}

		const method: Function = descriptor.value;
		pseudonyms.forEach(pseudo => {
			//@ts-ignore
			prototype[`!${pseudo}`] = function (...args: any[]) {
				return method.apply(this, args);
			};
		});

		return descriptor;
	};
}
