// @ts-check
import {
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import db from "./database";

const playersCollection = collection(db, "players");

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
    // check if player with similar name exists
    const q = query(playersCollection, where("name", "==", player.name));
    const querySnapshot = await getDocs(q);

    // if it exists, ask user to use a different name
    if (!querySnapshot.empty) {
      throw new Error(
        "Player with similar name exists. Please use a different name."
      );
    }

    // store user's score as a JSON string since it's a nested
    // array which firestore doesn't support
    player.score && (player.score = JSON.stringify(player.score));

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
    // get the player with the id
    const q = query(playersCollection, where("id", "==", id));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw new Error("Player not found");

    // store user's score as a JSON string since it's a nested
    // array which firestore doesn't support
    player.score && (player.score = JSON.stringify(player.score));

    // if it exists, update the player
    await updateDoc(querySnapshot.docs[0].ref, player);

    // return the updated player
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
    const q = query(playersCollection, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) throw new Error("Player not found");
    const player = querySnapshot.docs[0].data();

    // parse the score from JSON string to array
    player.score && (player.score = JSON.parse(player.score));
    return {
      id: querySnapshot.docs[0].id,
      ...player,
    };
  } catch (e) {
    console.error("Error getting document: ", e);
    return null;
  }
}

export { createPlayer, updatePlayer, getPlayer };
