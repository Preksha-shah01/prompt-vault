import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import CreatePrompt from "./components/CreatePrompt"; // Import the new component

function App() {
  const [user, loading] = useAuthState(auth);
  const [prompts, setPrompts] = useState([]);

  // Fetch prompts ONLY when a user is logged in
  useEffect(() => {
    if (!user) return;

    // Query: Select collection "prompts" where "uid" matches the current user
    const q = query(
      collection(db, "prompts"), 
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    // Real-time listener: Updates automatically when data changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const promptsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrompts(promptsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = () => {
    signInWithPopup(auth, googleProvider).catch((error) => alert(error.message));
  };

  if (loading) return <div className="h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-5 md:p-10">
      {/* HEADER */}
      <nav className="flex justify-between items-center mb-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          PromptVault 🔐
        </h1>
        
        {user ? (
          <div className="flex items-center gap-4">
            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-gray-600" />
            <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-white text-sm">Logout</button>
          </div>
        ) : (
          <button onClick={handleLogin} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200">
            Sign In
          </button>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto">
        {user ? (
          <>
            {/* 1. The Input Form */}
            <CreatePrompt user={user} />

            {/* 2. The List of Prompts */}
            <div className="grid gap-4">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="bg-gray-900 p-5 rounded-lg border border-gray-800 hover:border-indigo-500/50 transition group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 mb-2">
                      {prompt.tags?.map((tag, index) => (
                        <span key={index} className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded">#{tag}</span>
                      ))}
                    </div>
                    {/* Copy Button */}
                    <button 
                      onClick={() => navigator.clipboard.writeText(prompt.text)}
                      className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm">{prompt.text}</p>
                </div>
              ))}
              
              {prompts.length === 0 && (
                <p className="text-center text-gray-500 mt-10">No prompts yet. Add your first one above!</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center mt-20">
            <h2 className="text-5xl font-extrabold mb-6">Never lose a prompt again.</h2>
            <p className="text-xl text-gray-400">Login to access your personal vault.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;