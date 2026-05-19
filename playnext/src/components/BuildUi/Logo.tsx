function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Play Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-pink-600 shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          className="w-5 h-5 ml-0.5"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      {/* Brand Name */}
      <h1 className="text-2xl font-extrabold tracking-tight">
        <span className="text-black dark:text-white">
          Play
        </span>

        <span className="text-red-500">
          Next
        </span>
      </h1>
    </div>
  );
}

export default Logo;