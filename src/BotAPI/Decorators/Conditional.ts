import BaseBot from '..';

// Instance Method Decorator
export default function Conditional<T extends BaseBot>(
	condition: (this: T, ...args: any[]) => boolean,
) {
	return function (
		prototype: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const method: Function = descriptor.value;

		descriptor.value = function (...args: any[]) {
			//@ts-ignore
			return condition.apply(this, args)
				? method.apply(this, args)
				: undefined;
		};
		return descriptor;
	};
}

// if (
// 	newState.channel?.name === CONFIG.LOBBY_VOICE_CHANNEL &&
// 	(oldState.channel === null ||
// 		oldState.channel.name !== CONFIG.LOBBY_VOICE_CHANNEL)
// ) {
// 	// JOINED Waiting Room!
// 	if (!newState.member) throw new Error('FUCK');
// 	this.enqueue(newState.member.id, newState.member);
// } else if (
// 	oldState.channel?.name === CONFIG.LOBBY_VOICE_CHANNEL &&
// 	(newState.channel === null ||
// 		newState.channel.name !== CONFIG.LOBBY_VOICE_CHANNEL)
// ) {
// 	if (!newState.member) throw new Error('FUCK');
// 	this.dequeue(newState.member.id);
// }
