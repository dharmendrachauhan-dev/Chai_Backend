import { useState } from "react";

function AuthButton() {
  // Change this after real authentication
  const [user, setUser] = useState<null | {
    name: string;
    avatar: string;
  }>(null);

  const handleLogin = () => {
    // Example login response
    setUser({
      name: "Dharmendra",
      avatar:
        "https://i.pravatar.cc/150?img=12",
    });
  };

  return (
    <div className="flex items-center justify-center">
      {user ? (
        /* Profile Avatar */
        <button className="w-10 h-10 rounded-full overflow-hidden border border-zinc-300 hover:scale-105 transition">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </button>
      ) : (
        /* Sign In Button */
        <button
          onClick={handleLogin}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 transition"
        >
          {/* User Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-5 h-5 rounded-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75a17.933 17.933 0 01-7.5-1.632z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default AuthButton;