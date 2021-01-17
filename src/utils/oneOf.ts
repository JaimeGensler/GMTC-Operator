export default function oneOf(arr: any[]) {
	const randInt = Math.floor(Math.random() * arr.length);
	return arr[randInt];
}
