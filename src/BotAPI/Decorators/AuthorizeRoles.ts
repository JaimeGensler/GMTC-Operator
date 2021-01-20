import Discord from 'discord.js';
import Conditional from './Conditional';

// Instance Method Decorator
export default function AuthorizeRoles(...authedRoles: string[]) {
	return Conditional(function ({ member }: Discord.Message) {
		return !!member?.roles.cache.find(r => authedRoles.includes(r.name));
	});
}
