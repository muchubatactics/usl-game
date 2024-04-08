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

const sessionsCollection = collection(db, "sessions");

/**
 * Creates a session
 * @param {Record<string,any>} session - the session data
 * @returns {Promise<Record<string, any> | null>} the created session.
 * @throws if session not created
 *
 * @example
 * const session = await createSession({
 *      score: 0,
 *      status: "in-progress"
 * })
 *
 * console.log(session)
 *
 * // Output
 * // {
 * //   id: "session-id",
 * //   score: 0,
 * //   status: "in-progress"
 * // }
 */
async function createSession(session) {
  try {
    session.loggedInAt = Date.now();
    const createdSession = await addDoc(sessionsCollection, session);
    return {
      id: createdSession.id,
      ...session,
    };
  } catch (e) {
    console.error("Error creating session: ", e);
    return null;
  }
}

/**
 * Updates a session
 * @param {string} id - the session id
 * @param {Record<string,any>} session - the session data to update
 * @returns {Promise<Record<string, any> | null>} the updated session.
 * @throws if session not found
 *
 * @example
 * const session = await updateSession("session-id", {
 *      score: 100,
 *      status: "completed"
 * })
 *
 * if (!session) {
 *    console.log("Session not found")
 * }
 *
 * console.log(session)
 *
 * // Output
 * // {
 * //   id: "session-id",
 * //   score: 100,
 * //   status: "completed"
 * // }
 */
async function updateSession(id, session) {
  try {
    const q = query(sessionsCollection, where("id", "==", id));
    let querySnapshot = await getDocs(q);
    if (querySnapshot.empty) throw new Error("Session not found");
    await updateDoc(querySnapshot.docs[0].ref, session);

    // return the updated session
    querySnapshot = await getDocs(q);
    return {
      id,
      ...querySnapshot.docs[0].data(),
    };
  } catch (e) {
    console.error("Error updating session: ", e);
    return null;
  }
}

/**
 * Gets a session
 * @param {string} id - the session id
 * @returns {Promise<Record<string, any> | null>} the session.
 *
 * @example
 * const session = await getSession("session-id")
 */
async function getSession(id) {
  try {
    const q = query(sessionsCollection, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) throw new Error("Session not found");
    return {
      id,
      ...querySnapshot.docs[0].data(),
    };
  } catch (e) {
    console.error("Error getting session: ", e);
    return null;
  }
}

export { createSession, updateSession, getSession };
