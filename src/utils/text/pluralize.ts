export default function pluralize(singular: string, plural: string) {
	return function (count: number) {
		return count === 1 ? singular : plural;
	};
}
