import { useState, useContext } from "react";
import { UserContext } from "../context/user.context";
import useTheme from "../hooks/useTheme";
import ProfileImageUpload from "./ProfileImageUpload";
import EditProfileModal from "./EditProfileModal";
import ActivityTimeline from "./ActivityTimeline";
import ConnectedAccounts from "./ConnectedAccounts";

export default function Profile() {
  const { user } = useContext(UserContext);
  const { theme, setTheme } = useTheme();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="p-6 max-w-5xl mx-auto dark:text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* Left */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <ProfileImageUpload avatar={user.avatar} />
          <h2 className="text-lg mt-4">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>

          <button
            onClick={() => setEditOpen(true)}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded"
          >
            Edit Profile
          </button>
        </div>

        {/* Right */}
        <div className="md:col-span-2 space-y-6">
          <ActivityTimeline
            activities={[
              { action: "Created project PR5", time: "2 min ago" },
              { action: "Joined PR9", time: "10 min ago" },
            ]}
          />
          <ConnectedAccounts />
        </div>
      </div>

      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
