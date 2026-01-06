export default function ProfileImageUpload({ avatar, onUpload }) {
  return (
    <div className="flex flex-col items-center">
      <img
        src={avatar || "/avatar.png"}
        className="w-24 h-24 rounded-full object-cover"
      />

      <label className="mt-2 text-sm cursor-pointer text-indigo-600">
        Change Photo
        <input
          type="file"
          hidden
          onChange={(e) => onUpload(e.target.files[0])}
        />
      </label>
    </div>
  );
}
