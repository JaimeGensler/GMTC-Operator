function log(message: string) {
	const timeString = new Date().toString();
	console.log(`${timeString} | ${message}`);
}
function error(e: Error) {
	const timeString = new Date().toTimeString();
	console.error(` ${timeString}: ${e.message}`);
}
function start() {
	console.clear();
	log('Starting OperatorBot...');
}

export default {
	start,
	log,
	error,
};
