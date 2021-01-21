import { GuildMember } from 'discord.js';

export default function hasRole(roleName: string) {
	return function (member: GuildMember | null) {
		return !!member?.roles.cache.find(r => r.name === roleName);
	};
}

export const isHeadTriviaMaster = hasRole('Head Master');
export const isTriviaMaster = hasRole('Trivia Master');
export const isPhoneAnswerer = hasRole('Phone Answerer');
