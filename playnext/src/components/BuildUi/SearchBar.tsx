import { Search } from "lucide-react";
import { useState } from "react";

function SearchBar() {
  const [search, setSearch] = useState("");

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();

    console.log(search);

    // API call here
    // navigate(`/search?q=${search}`)

    setSearch("");
  };

  return (
    <form
      onSubmit={submitForm}
      className="w-full flex items-center justify-center px-4"
    >
      <div className="flex items-center w-full max-w-2xl border border-zinc-300 dark:border-zinc-700 rounded-full overflow-hidden bg-white dark:bg-zinc-900">
        
        {/* Input */}
        <input
          type="text"
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          required
          className="w-full px-5 py-2.5 bg-transparent outline-none text-sm"
        />

        {/* Search Button */}
        <button
          type="submit"
          className="px-5 py-2.5 cursor-pointer border-l border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <Search className="w-5 h-5"/>
        </button>
      </div>
    </form>
  );
}

export default SearchBar;