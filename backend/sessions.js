// @ts-check
import {
  addDoc,
  collection,
  documentId,
  getDocs,
  limit,
  orderBy,
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
    // store user's score as a JSON string since it's a nested
    // array which firestore doesn't support
    session.scores && (session.scores = JSON.stringify(session.scores));

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
    const q = query(sessionsCollection, where(documentId(), "==", id));
    let querySnapshot = await getDocs(q);
    if (querySnapshot.empty) throw new Error("Session not found");

    // store user's score as a JSON string since it's a nested
    // array which firestore doesn't support
    session.scores && (session.scores = JSON.stringify(session.scores));

    await updateDoc(querySnapshot.docs[0].ref, session);

    querySnapshot = await getDocs(q);
    return {
      id: querySnapshot.docs[0].id,
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
    const q = query(sessionsCollection, where(documentId(), "==", id));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) throw new Error("Session not found");
    const session = querySnapshot.docs[0].data();

    // parse the score from JSON string to array
    session.scores && (session.scores = JSON.parse(session.scores));

    return {
      id,
      ...session,
    };
  } catch (e) {
    console.error("Error getting session: ", e);
    return null;
  }
}

/**
 * Gets the previous session for a player
 * @param {string} playerId - the player id
 * @returns {Promise<Record<string, any> | null>} the previous session.
 * @throws if previous session not found
 *
 * @example
 * const session = await getPreviousSession("player-id")
 */
async function getPreviousSession(playerId) {
  try {
    // get all sessions for the player
    const q = query(
      sessionsCollection,
      where("playerId", "==", playerId),
      orderBy("levelStartedAt", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) throw new Error("No previous session found");
    const session = querySnapshot.docs[0].data();

    // parse the score from JSON string to array
    session.scores && (session.scores = JSON.parse(session.scores));

    return {
      id: querySnapshot.docs[0].id,
      ...session,
    };
  } catch (e) {
    console.error("Error getting previous session: ", e);
    return null;
  }
}

/**
 * Gets all sessions for a player
 * @param {string} playerId - the player id
 * @returns {Promise<Record<string, any>[] | null>} the player sessions.
 * @throws if no sessions found
 *
 * @example
 * const sessions = await getPlayerSessions("player-id")
 */
async function getPlayerSessions(playerId) {
  try {
    const q = query(sessionsCollection, where("playerId", "==", playerId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) throw new Error("No sessions found");
    return querySnapshot.docs.map(function (doc) {
      const session = doc.data();

      // parse the score from JSON string to array
      session.scores && (session.scores = JSON.parse(session.scores));

      return { id: doc.id, ...session };
    });
  } catch (e) {
    console.error("Error getting player sessions: ", e);
    return null;
  }
}

export {
  createSession,
  updateSession,
  getSession,
  getPreviousSession,
  getPlayerSessions,
};
