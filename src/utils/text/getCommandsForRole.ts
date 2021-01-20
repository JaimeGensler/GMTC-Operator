import Discord from 'discord.js';
import greet from './greet';

const isRole = (roleName: string) => (member: Discord.GuildMember | null) => {
	return !!member?.roles.cache.find(r => r.name === roleName);
};
const isHeadMaster = isRole('Head Master');
const isTriviaMaster = isRole('Trivia Master');
const isPhoneAnswerer = isRole('Phone Answerer');

const commandLookup = {
	HM: [
		' - **!start** - Start the queue. No other bot commands will work until this is done.',
		' - **!stop** - Stop the queue. This will clear the queue and prevent other commands from working.',
	],
	TM: [
		' - **!status** - Get the current status of the bot. This includes active/inactive state, queue info, and lifetime stats.',
	],
	PA: [
		' - **!phone** (*also **!next** and **!answer***) - Moves the next player in queue (*if there is one*) into your call.',
		' - **!queue** (*also **!q***) - Prints the current number of players in queue. Call **!queue list** for the current queue order.',
	],
};

export default function getCommandsForRole(member: Discord.GuildMember | null) {
	const is = {
		HM: isHeadMaster(member),
		TM: isTriviaMaster(member),
		PA: isPhoneAnswerer(member),
	};
	const roleTexts = [
		`${greet(
			member,
		)} I'm OperatorBot! Here are the commands you have access to:`,
	];
	if (is.HM) {
		roleTexts.push(...commandLookup.HM);
	}
	if (is.TM || is.HM) {
		roleTexts.push(...commandLookup.TM);
	}
	if (is.PA || is.TM || is.HM) {
		roleTexts.push(...commandLookup.PA);
	}
	return roleTexts.join('\n');
}
