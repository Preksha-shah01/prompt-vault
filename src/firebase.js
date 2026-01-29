import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAjejTwIjY1-3aYiSoHHcwzH6eBugtESBc",
    authDomain: "romptvault.firebaseapp.com",
    projectId: "romptvault",
    storageBucket: "romptvault.firebasestorage.app",
    messagingSenderId: "558471053310",
    appId: "1:558471053310:web:fcd5062a0904e38f920aaf"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);