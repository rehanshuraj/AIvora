export default function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="font-semibold mb-4">Edit Profile</h3>

        <input
          className="w-full mb-3 p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full mb-3 p-2 border rounded"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => onSave({ name, bio })}
            className="bg-indigo-600 text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
