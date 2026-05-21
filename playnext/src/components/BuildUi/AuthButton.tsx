import { Link, useNavigate } from "react-router-dom";

function AuthButton() {
  const navigate = useNavigate();

  const user = null; // Example

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    console.log("logout");
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {user ? (
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border"
          />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full bg-black text-white"
          >
            Logout
          </button>
        </div>
      ) : (
        /* Redirect Login Page */
        <button
          onClick={handleLoginRedirect}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75a17.933 17.933 0 01-7.5-1.632z"
            />
          </svg>
        </button>
      )}
      <Link 
      to="/signup"
      className="hover:underline hover:text-blue-600 text-pink-500"
      >
        SignUp
      </Link>
      <Link 
      to="/signup"
      className="hover:underline hover:text-blue-600 text-pink-500"
      >
        Login
      </Link>
    </div>
  );
}

export default AuthButton;