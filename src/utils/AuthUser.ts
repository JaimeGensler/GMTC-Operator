import Conditional from '../BotAPI/Decorators/Conditional';

export default function AuthUser(id: string) {
	return Conditional(({ member }) => member.id === id);
}
