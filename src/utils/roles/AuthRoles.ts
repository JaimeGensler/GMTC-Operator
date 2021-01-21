import Conditional from '../../BotAPI/Decorators/Conditional';
import { isHeadTriviaMaster, isTriviaMaster, isPhoneAnswerer } from './hasRole';

export const AuthHeadTM = Conditional(function ({ member }) {
	return isHeadTriviaMaster(member);
});

export const AuthTM = Conditional(function ({ member }) {
	return isTriviaMaster(member) || isHeadTriviaMaster(member);
});

export const AuthPhoneAnswerer = Conditional(function ({ member }) {
	return (
		isPhoneAnswerer(member) ||
		isTriviaMaster(member) ||
		isHeadTriviaMaster(member)
	);
});
