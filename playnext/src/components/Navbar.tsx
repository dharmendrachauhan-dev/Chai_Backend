import AuthButton from "./BuildUi/AuthButton.tsx"
import Logo from "./BuildUi/Logo.tsx"
import SearchBar from "./BuildUi/SearchBar.tsx"

function Navbar() {
  return (
    <nav
    className="mx-auto max-w-7xl py-4 flex justify-between items-center"
    >
      <Logo/>
      <SearchBar/>
      <AuthButton/>
    </nav>
  )
}

export default Navbar
