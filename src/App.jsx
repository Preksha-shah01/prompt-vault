import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

function App() {
  const handleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        // If this alerts, YOU WON!
        alert(`Welcome, ${result.user.displayName}!`);
        console.log(result.user);
      })
      .catch((error) => {
        console.error(error);
        alert("Login failed: " + error.message);
      });
  };

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-3xl font-bold mb-4">PromptVault</h1>
        <button 
          onClick={handleLogin}
          className="bg-white px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition cursor-pointer"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default App;