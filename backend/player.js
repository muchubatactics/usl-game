// @ts-check
import {
	addDoc,
	collection,
	documentId,
	getDocs,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import db from "./database";
import { changeEpochToReadable, hashString } from "./utils";

const playersCollection = collection(db, "players");
const serverSalt = "951wtNtnSOaES4Iq";
/**
 * creates a player
 * @param {Record<string,any>} player
 * @returns {Promise<Record<string, any> | null>} id of the created player
 * @throws if player with similar name exists
 *
 * @example
 * const player = await createPlayer({
 *      name: "John Doe",
 *      age: 20,
 * })
 */
async function createPlayer(player) {
	try {
		// save name and age as a single md5 hash
		const userHash = hashString(player.name + player.age + serverSalt);

		// if player with similar hash exists, return that player
		const q = query(playersCollection, where("userHash", "==", userHash));
		const querySnapshot = await getDocs(q);
		if (!querySnapshot.empty) {
			return {
				id: querySnapshot.docs[0].id,
				...querySnapshot.docs[0].data(),
			};
		}

		// set createdAt to current date as a timestamp
		player.createdAt = player.updatedAt = changeEpochToReadable(Date.now());

		player.userHash = userHash;
		const createdPlayer = await addDoc(playersCollection, player);
		return {
			id: createdPlayer.id,
			...player,
		};
	} catch (e) {
		console.error("Error adding document: ", e);
		return null;
	}
}

/**
 * Updates a player
 * @param {string} id
 * @param {Record<string,any>} player
 * @returns {Promise<Record<string, any> | null>} the updated player.
 *
 * @example
 * const player = await updatePlayer("player-id", {
 *      name: "John Doe",
 *      age: 20,
 * })
 */
async function updatePlayer(id, player) {
	try {
		const q = query(playersCollection, where(documentId(), "==", id));
		let querySnapshot = await getDocs(q);
		if (querySnapshot.empty) throw new Error("Player not found");

		// set updatedAt to current date as a timestamp
		player.updatedAt = changeEpochToReadable(Date.now());

		await updateDoc(querySnapshot.docs[0].ref, player);

		querySnapshot = await getDocs(q);
		return {
			id: querySnapshot.docs[0].id,
			...querySnapshot.docs[0].data(),
		};
	} catch (e) {
		console.error("Error updating document: ", e);
		return null;
	}
}

/**
 * Gets a player
 * @param {string} id
 * @returns {Promise<Record<string, any> | null>} the player.
 * @throws if player not found
 *
 * @example
 * const player = await getPlayer("player-id")
 */
async function getPlayer(id) {
	try {
		const q = query(playersCollection, where(documentId(), "==", id));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.empty) throw new Error("Player not found");
		const player = querySnapshot.docs[0];
		return {
			id: player.id,
			...player.data(),
		};
	} catch (e) {
		console.error("Error getting document: ", e);
		return null;
	}
}

export { createPlayer, updatePlayer, getPlayer };
