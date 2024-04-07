// @ts-check
import { getFirestore } from "@firebase/firestore";
import { initializeApp } from "firebase/app";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "OUR_API_KEY",
  authDomain: "masaka-mwana.firebaseapp.com",
  projectId: "masaka-mwana",
  storageBucket: "masaka-mwana.appspot.com",
  messagingSenderId: "824577596739",
  appId: "1:824577596739:web:9d14b85d6cff62ed7ba3f6",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
