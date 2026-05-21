import { useState } from "react";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage("Login successful ✅");

        setFormData({
          email: "",
          password: "",
        });
      } else {
        setSuccess(false);
        setMessage(result.message || "Login failed ❌");
      }

      console.log(result);
    } catch (error) {
      console.log(error);
      setSuccess(false);
      setMessage("Something went wrong ❌");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col m-15 gap-4 max-w-md mx-auto p-4 border-2 rounded-xl"
    >
      <h1 className="text-2xl font-bold text-center text-pink-500">
        Login
      </h1>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="border p-2 rounded focus:outline-none focus:ring-pink-600 focus:ring-2"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        className="border p-2 rounded focus:outline-none focus:ring-pink-600 focus:ring-2"
      />

      {message && (
        <p
          className={`text-center font-medium ${
            success ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        className="active:scale-98 transition-all bg-linear-to-br from-pink-500 to-red-500 tracking-wider font-bold text-white py-2 rounded cursor-pointer"
      >
        Login
      </button>
    </form>
  );
}

export default Login;