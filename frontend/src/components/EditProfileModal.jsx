export default function EditProfileModal({ user, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>

        <input
          defaultValue={user.name}
          className="w-full mb-3 p-2 border rounded"
          placeholder="Name"
        />

        <textarea
          defaultValue={user.bio}
          className="w-full mb-3 p-2 border rounded"
          placeholder="Bio"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={onSave}
            className="bg-indigo-600 text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
