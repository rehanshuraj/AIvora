import React from "react";

const CreateProjectModal = ({
  isOpen,
  onClose,
  projectName,
  setProjectName,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-96 rounded-lg shadow-lg p-6">
        
        <h2 className="text-lg font-semibold mb-4">
          Create New Project
        </h2>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm bg-black text-white rounded hover:opacity-90"
            >
              Create
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateProjectModal;
