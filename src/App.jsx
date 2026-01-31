import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  orderBy 
} from "firebase/firestore";
import CreatePrompt from "./components/CreatePrompt";

function App() {
  const [user, loading] = useAuthState(auth);
  const [prompts, setPrompts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Data (Real-time Listener)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "prompts"), 
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const promptsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrompts(promptsData);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Handlers
  const handleLogin = () => {
    signInWithPopup(auth, googleProvider).catch((error) => alert(error.message));
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this prompt?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "prompts", id));
      } catch (error) {
        console.error("Error removing document: ", error);
        alert("Error deleting: " + error.message);
      }
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Optional: You could add a toast notification here
    alert("Copied to clipboard!");
  };

  // 3. Search Logic
  const filteredPrompts = prompts.filter((prompt) => {
    const textMatch = prompt.text?.toLowerCase().includes(searchTerm.toLowerCase());
    const tagMatch = prompt.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return textMatch || tagMatch;
  });

  if (loading) return <div className="h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-5 md:p-10 font-sans selection:bg-indigo-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="flex justify-between items-center mb-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent cursor-default">
          PromptVault 🔐
        </h1>
        
        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-gray-400 text-sm">{user.displayName}</span>
            
            {/* PROFILE PICTURE FIX */}
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`} 
              alt="Profile" 
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border-2 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] object-cover"
            />
            
            <button 
              onClick={() => signOut(auth)}
              className="text-xs bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:border-red-500/50 hover:bg-red-900/20 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            Sign In
          </button>
        )}
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-4xl mx-auto">
        {user ? (
          <>
            {/* SEARCH BAR */}
            <div className="mb-8 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500">🔍</span>
              </div>
              <input 
                type="text" 
                placeholder="Search prompts or tags..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-4 bg-gray-900 rounded-xl border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-500 transition shadow-lg"
              />
            </div>

            {/* INPUT FORM (Imported Component) */}
            <CreatePrompt user={user} />

            {/* PROMPT LIST */}
            <div className="grid gap-4 mt-8">
              {filteredPrompts.map((prompt) => (
                <div key={prompt.id} className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition group shadow-sm hover:shadow-indigo-500/10 relative">
                  
                  {/* Header: Tags & Actions */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags?.map((tag, index) => (
                        <span key={index} className="text-xs font-medium bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleCopy(prompt.text)}
                        className="text-xs bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition"
                      >
                        Copy
                      </button>
                      <button 
                        onClick={() => handleDelete(prompt.id)}
                        className="text-xs bg-red-900/20 border border-red-900/30 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-900/40 hover:text-red-300 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {prompt.text}
                  </p>
                </div>
              ))}
              
              {/* Empty State */}
              {filteredPrompts.length === 0 && (
                <div className="text-center py-20 border border-gray-800 border-dashed rounded-xl bg-gray-900/30">
                  <p className="text-gray-500">
                    {searchTerm ? "No matches found." : "Your vault is empty. Add a prompt above!"}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* --- LANDING PAGE (Logged Out) --- */
          <div className="text-center mt-32 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-8 tracking-tight">
              Master your <span className="text-indigo-400">AI workflow</span>.
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop losing your best ChatGPT and Midjourney prompts. 
              Save, organize, and search them in seconds.
            </p>
            <button 
              onClick={handleLogin}
              className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 hover:scale-105 transform duration-200"
            >
              Get Started for Free
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
