export default function ProfileImageUpload({ avatar, email, onUpload }) {
  const fallbackLetter = email?.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center">
      {avatar ? (
        <img
          src={avatar}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold">
          {fallbackLetter}
        </div>
      )}

      <label className="mt-3 text-sm cursor-pointer text-indigo-500 hover:underline">
        Change Photo
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => onUpload?.(e.target.files[0])}
        />
      </label>
    </div>
  );
}
