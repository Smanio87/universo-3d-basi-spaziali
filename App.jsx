import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc,
    collection,
    onSnapshot
} from "firebase/firestore";

// Aggiungi in alto nel componente
const [allBases, setAllBases] = useState([]);

// Listener in tempo reale
useEffect(() => {
    const unsub = onSnapshot(collection(db, "bases"), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data());
        setAllBases(data);
    });
    return () => unsub(); // pulizia
}, []);

const firebaseConfig = {
    apiKey: "AIzaSyAQ4udTL0Y7BYyowcGrHTR9EjDYVFrA1-s",
    authDomain: "YOUR_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
    const [user, setUser] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);

    onAuthStateChanged(auth, (u) => {
        if (u) setUser(u);
    });

    const handleLogin = async () => {
        await signInAnonymously(auth);
    };

    const handleSelect = async (x, y) => {
        setSelectedCell({ x, y });
        if (user) {
            await setDoc(doc(db, "bases", user.uid), {
                uid: user.uid,
                x,
                y,
                createdAt: new Date()
            });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
            {!user ? (
                <button onClick={handleLogin} className="bg-blue-500 px-4 py-2 rounded">
                    Entra nell'universo
                </button>
            ) : (
                <>
                    <h1 className="text-xl mb-4">Clicca su una zona dello spazio per creare la tua base</h1>
                    <div className="grid grid-cols-5 gap-2">
                        {[...Array(25)].map((_, i) => {
                            const x = i % 5;
                            const y = Math.floor(i / 5);

                            const base = allBases.find((b) => b.x === x && b.y === y);
                            const isMine = base?.uid === user?.uid;

                            return (
                                <div
                                    key={i}
                                    onClick={() => handleSelect(x, y)}
                                    className={`w-16 h-16 border cursor-pointer flex items-center justify-center text-xs
                            ${base
                                            ? isMine
                                                ? "bg-green-500"
                                                : "bg-red-600"
                                            : "bg-gray-800"
                                        }`}
                                >
                                    {base ? (isMine ? "👽" : "🚀") : ""}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
