import Conditional from '../../BotAPI/Decorators/Conditional';
import { isHeadMaster, isTriviaMaster, isPhoneAnswerer } from './roles';

export const AuthHeadTM = Conditional(function ({ member }) {
	return isHeadMaster(member);
});

export const AuthTM = Conditional(function ({ member }) {
	return isTriviaMaster(member) || isHeadMaster(member);
});

export const AuthPhoneAnswerer = Conditional(function ({ member }) {
	return (
		isPhoneAnswerer(member) ||
		isTriviaMaster(member) ||
		isHeadMaster(member)
	);
});
