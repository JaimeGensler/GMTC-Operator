import { GuildMember } from 'discord.js';
import oneOf from '../oneOf';

const greetings = [
	['Howdy', '!'],
	['Hey there', '!'],
	['Sah', '.'],
	['Heya', '.'],
	["What's up", '?'],
	['Hello', '!'],
	['Hi', '!'],
	['Hi there', '!'],
	['Howdy do', '?'],
	["What's poppin'", '?!?!'],
	['Cheers', '.'],
	["How's it hanging", '?'],
];

export default function greet(member: GuildMember | null) {
	const name = member?.nickname ?? member?.displayName ?? 'my friends';
	const [phrase, punctuation] = oneOf(greetings);
	return `${phrase}, ${name}${punctuation}`;
}
