import { useState } from "react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("username", formData.username);

      if (avatar) {
        data.append("avatar", avatar);
      }

      const response = await fetch("YOUR_API_ENDPOINT", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      console.log(result);

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      alert("User registered successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Register
        </h1>

        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">
            Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-medium">
            Gmail
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your gmail"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label className="block mb-1 font-medium">
            Username
          </label>

          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 font-medium">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Avatar */}
        <div>
          <label className="block mb-1 font-medium">
            Avatar
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default SignUp;