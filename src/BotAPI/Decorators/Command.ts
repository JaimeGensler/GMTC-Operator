import Discord from 'discord.js';
import BotBase from '..';

// Instance Method Decorator
export default function Command(trigger: string) {
	const commandName = `!${trigger}`;

	return function (
		prototype: any,
		methodName: string,
		descriptor: PropertyDescriptor,
	) {
		if (!(prototype instanceof BotBase)) {
			throw new Error();
		}

		const method: Function = descriptor.value;
		if (commandName in prototype) {
			throw new Error('Duplicate command name!');
		}

		//@ts-ignore
		prototype[commandName] = function (...args: any[]) {
			return method.apply(this, args);
		};

		// This is the solution I have for now, maybe there's a better one
		return new Proxy(descriptor, {
			get(descProxy, property) {
				return property === 'value'
					? //@ts-ignore
					  prototype[commandName]
					: //@ts-ignore
					  descProxy[property];
			},
			set(descProxy, property, value) {
				//@ts-ignore
				prototype[commandName] = value;
				return true;
			},
		});
	};
}
