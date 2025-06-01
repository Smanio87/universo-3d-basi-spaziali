import React, { useState, useEffect } from "react";
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

const firebaseConfig = {
    apiKey: "AIzaSyAQ4udTL0Y7BYyowcGrHTR9EjDYVFrA1-s",
    authDomain: "millionspace-17829.firebaseapp.com",
    projectId: "millionspace-17829",
    storageBucket: "millionspace-17829.firebasestorage.app",
    messagingSenderId: "339756686266",
    appId: "1:339756686266:web:eb4ddcf3e74d21ba231b83",
    measurementId: "G-FJ88ZRBR3M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
    const [user, setUser] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [allBases, setAllBases] = useState([]); // ✅ correttamente DENTRO App()

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "bases"), (snapshot) => {
            const data = snapshot.docs.map((doc) => doc.data());
            setAllBases(data);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) setUser(u);
        });
        return () => unsubscribe();
    }, []);

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
