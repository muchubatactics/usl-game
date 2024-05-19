import { MD5 } from "crypto-js";
export function changeEpochToReadable(epoch) {
	const date = new Date(epoch);
	return date.toUTCString();
}
export function hashString(str) {
	return MD5(str).toString();
}
