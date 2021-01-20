import Command from './Command';
import Conditional from './Conditional';
import AuthorizeRoles from './AuthorizeRoles';

export { Command };
export { Conditional };
export { AuthorizeRoles };

export const AuthHM = AuthorizeRoles('Head Master');
export const AuthTM = AuthorizeRoles('Head Master', 'Trivia Master');
export const AuthPhoneAnswerer = AuthorizeRoles(
	'Head Master',
	'Trivia Master',
	'Phone Answerer',
);
