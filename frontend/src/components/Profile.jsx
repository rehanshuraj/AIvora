import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import useTheme from "../hooks/useTheme";
import ProfileImageUpload from "./ProfileImageUpload";
import axios from "../config/axios"; // ✅ FIX 1

export default function Profile() {
  const { user, setUser } = useContext(UserContext); // ✅ FIX 2
  const { theme, setTheme } = useTheme();
  const [editOpen, setEditOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  // ✅ CLEANUP preview URL (best practice)
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ✅ Avatar upload
  const handleAvatarUpload = async (file) => {
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await axios.post("/users/avatar", formData);

    setUser((prev) => ({
      ...prev,
      avatar: res.data.avatar,
    }));
  };

  // ✅ Save profile
  const saveProfile = async (data) => {
    const res = await axios.put("/users/update", data);
    setUser(res.data);
    setEditOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Profile
        </h2>

        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="text-xl"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <ProfileImageUpload
            avatar={preview || user?.avatar}
            email={user?.email}
            onUpload={handleAvatarUpload}
          />

          <p className="mt-4 text-center text-gray-800 dark:text-gray-100">
            {user?.email}
          </p>

          <button
            onClick={() => setEditOpen(true)}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
          >
            Edit Profile
          </button>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Recent Activity
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>• Created project PR5 — 2 min ago</li>
              <li>• Joined PR9 — 10 min ago</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Connected Accounts
            </h3>
            <div className="flex gap-3">
              <button className="px-3 py-2 border rounded text-sm">
                GitHub ✓
              </button>
              <button className="px-3 py-2 border rounded text-sm opacity-50">
                Google ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
