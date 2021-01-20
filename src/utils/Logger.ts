function log(message: string) {
	const timeString = new Date().toString();
	console.log(timeString, '|', message);
}
function error(e: Error) {
	const timeString = new Date().toTimeString();
	console.error(timeString, '|', e.message);
}

export default {
	log,
	error,
};
