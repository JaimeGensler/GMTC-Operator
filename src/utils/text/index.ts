import pluralize from './pluralize';
import greet from './greet';

export { pluralize };
export { greet };

export const isAre = pluralize('person', 'people');
export const personPeople = pluralize('person', 'people');
