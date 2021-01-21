import { GuildMember } from 'discord.js';
import { isHeadMaster, isTriviaMaster, isPhoneAnswerer } from '../roles/roles';
import greet from './greet';

const commandLookup = {
	HM: [
		' - **!start** - Start the queue. No other bot commands will work until this is done.',
		' - **!stop** - Stop the queue. This will clear the queue and prevent other commands from working.',
	],
	TM: [
		' - **!status** - Get the current status of the bot. This includes active/inactive state, queue info, and lifetime stats.',
		' - **!clear** - Clears all users out of the Waiting Room.',
	],
	PA: [
		' - **!phone** (*also **!next** and **!answer***) - Moves the next player in queue (*if there is one*) into your call.',
		' - **!queue** (*also **!q***) - Prints the current number of players in queue. Call **!queue list** for the current queue order.',
	],
};

export default function getCommandsForRole(member: GuildMember | null) {
	const isRole = {
		HM: isHeadMaster(member),
		TM: isTriviaMaster(member),
		PA: isPhoneAnswerer(member),
	};
	const roleTexts = [
		`${greet(
			member,
		)} I'm OperatorBot! Here are the commands you have access to:`,
	];
	if (isRole.HM) {
		roleTexts.push(...commandLookup.HM);
	}
	if (isRole.TM || isRole.HM) {
		roleTexts.push(...commandLookup.TM);
	}
	if (isRole.PA || isRole.TM || isRole.HM) {
		roleTexts.push(...commandLookup.PA);
	}
	return roleTexts.join('\n');
}
