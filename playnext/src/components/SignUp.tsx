import { useState } from "react";

function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

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
      const data = new FormData();

      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("username", formData.username);
      data.append("password", formData.password);

      if (avatar) {
        data.append("avatar", avatar);
      }

      if (coverImage) {
        data.append("coverImage", coverImage);
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/users/register",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      console.log(result);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col m-15 gap-4 max-w-md mx-auto p-4 border-2 rounded-xl"
    >
      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        required
        className="border p-2 rounded focus:outline-none focus:ring-pink-600 focus:ring-2"
      />

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
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
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

      {/* Avatar */}

      <label className="w-full max-w-sm cursor-pointer">
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-2 flex items-center justify-between flex-row gap-3 hover:border-pink-500 duration-300 ">
          <p className="text-sm font-medium text-gray-700">
            Upload Avatar Image
          </p>
          <span
            className="px-4 py-2 bg-pink-400 text-white rounded-lg text-sm hover:opacity-90"
          >
            Choose File
          </span>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setAvatar(e.target.files?.[0] || null)
          }
          required
          className="hidden"
        />
      </label>

      {/* Cover Image */}
      <label className="w-full max-w-sm cursor-pointer">
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-2 flex items-center justify-between flex-row gap-3 hover:border-pink-500 duration-300 ">
          <p className="text-sm font-medium text-gray-700">
            Upload Cover Image
          </p>
          <span
            className="px-4 py-2 bg-pink-400 text-white rounded-lg text-sm hover:opacity-90"
          >
            Choose File
          </span>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setCoverImage(e.target.files?.[0] || null)
          }
          className="hidden"
        />
      </label>

      <button
        type="submit"
        className="active:scale-98 transition-all bg-linear-to-br from-pink-500 to-red-500 tracking-wider font-bold  text-white py-2 rounded cursor-pointer "
      >
        Sign-Up
      </button>
    </form>
  );
}

export default SignUp;