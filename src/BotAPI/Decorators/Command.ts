import BotBase from '..';

// Instance Method Decorator
export default function Command(...triggers: string[]) {
	return function (
		prototype: any,
		methodName: string,
		descriptor: PropertyDescriptor,
	) {
		if (!(prototype instanceof BotBase)) {
			throw new Error(
				'Command decorator must only be used within an instance of BotBase',
			);
		}

		if (prototype.commands == null) {
			prototype.commands = {};
		}

		triggers.forEach(t => {
			const cmd = `!${t}`;
			if (cmd in prototype.commands) {
				throw new Error(`Duplicate command name '${t}'!`);
			}
			prototype.commands[cmd] = methodName;
		});

		return descriptor;
	};
}
