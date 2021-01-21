import Discord from 'discord.js';
import BotBase from '..';

// Instance Method Decorator
export default function Command(...triggers: string[]) {
	if (triggers.length === 0) {
		throw new Error('Commands must have at least one trigger.');
	}
	const primaryTrigger = `!${triggers[0]}`;

	return function (
		prototype: any,
		methodName: string,
		descriptor: PropertyDescriptor,
	) {
		if (!(prototype instanceof BotBase)) {
			throw new Error();
		}

		const method: Function = descriptor.value;

		triggers.forEach(trigger => {
			//@ts-ignore
			prototype[`!${trigger}`] = function (...args: any[]) {
				return method.apply(this, args);
			};
		});

		// This is the solution I have for now, maybe there's a better one
		return new Proxy(descriptor, {
			get(descProxy, key) {
				return key === 'value'
					? //@ts-ignore
					  prototype[primaryTrigger]
					: //@ts-ignore
					  descProxy[key];
			},
			set(descProxy, property, value) {
				triggers.forEach(trigger => {
					//@ts-ignore
					prototype[`!${trigger}`] = value;
				});
				return true;
			},
		});
	};
}
