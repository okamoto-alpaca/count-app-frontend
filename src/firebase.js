import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestoreの機能をインポート

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZy35lIPgHKli3n7yvyRrOKx2PGDOd2Ag",
  authDomain: "my-count-app-daisho-2025.firebaseapp.com",
  projectId: "my-count-app-daisho-2025",
  storageBucket: "my-count-app-daisho-2025.firebasestorage.app",
  messagingSenderId: "872210970156",
  appId: "1:872210970156:web:6b1ac7c81793f2f790c389"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// Firestoreデータベースへの接続を確立し、他のファイルで使えるようにする
export const db = getFirestore(app);