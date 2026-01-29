import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CreatePrompt = ({ user }) => {
    const [text, setText] = useState("");
    const [tags, setTags] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);

    try {
      // 1. Create a reference to the "prompts" collection
        const promptsRef = collection(db, "prompts");

      // 2. Add the new document with the user's ID
        await addDoc(promptsRef, {
        text: text,
        tags: tags.split(",").map(tag => tag.trim()), // Convert "react, css" to ["react", "css"]
        uid: user.uid, // IMPORTANT: Links this prompt to the logged-in user
        createdAt: serverTimestamp()
        });

      // 3. Clear the form
        setText("");
        setTags("");
        alert("Prompt saved to Vault!");
    } catch (error) {
        console.error("Error adding prompt: ", error);
        alert("Error saving: " + error.message);
    }

    setIsSubmitting(false);
    };

    return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-white">Add New Prompt</h3>
    
        <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your AI prompt here..."
        className="w-full h-32 p-3 bg-gray-900 text-white rounded-md border border-gray-600 focus:border-indigo-500 focus:outline-none mb-4"
        />

        <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (e.g. coding, email, writing)"
        className="w-full p-3 bg-gray-900 text-white rounded-md border border-gray-600 focus:border-indigo-500 focus:outline-none mb-4"
        />

        <button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-indigo-600 text-white px-6 py-2 rounded-md font-bold hover:bg-indigo-500 transition disabled:opacity-50"
        >
        {isSubmitting ? "Saving..." : "Save to Vault"}
        </button>
    </form>
    );
};

export default CreatePrompt;