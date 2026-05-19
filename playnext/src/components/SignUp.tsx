import { useState } from "react";

function Register() {
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
      className="flex flex-col gap-4 max-w-md mx-auto p-4"
    >
      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      {/* Avatar */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setAvatar(e.target.files?.[0] || null)
        }
      />

      {/* Cover Image */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setCoverImage(e.target.files?.[0] || null)
        }
      />

      <button
        type="submit"
        className="bg-black text-white py-2 rounded"
      >
        Register
      </button>
    </form>
  );
}

export default Register;