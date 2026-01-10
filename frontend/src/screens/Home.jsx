import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import CreateProjectModal from "../components/CreateProjectModal";
import Profile from "../components/Profile";

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("dashboard");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);

  // ================= Dummy Build Stream =================
  const buildEvents = [
    {
      id: 1,
      actor: "Rehan",
      action: "created a new project",
      target: "PR5",
      time: "2 min ago",
    },
    {
      id: 2,
      actor: "Diya",
      action: "joined project",
      target: "PR9",
      time: "10 min ago",
    },
    {
      id: 3,
      actor: "Rehan",
      action: "created file",
      target: "index.js",
      time: "30 min ago",
    },
  ];

  // ================= Create Project =================
  async function createProject(e) {
    e.preventDefault();
    if (!projectName.trim()) return alert("Project name required");

    try {
      await axios.post("/projects/create", { name: projectName });
      setIsCreateOpen(false);
      setProjectName("");
    } catch {
      alert("Something went wrong");
    }
  }

  // ================= Fetch Projects =================
  useEffect(() => {
    axios.get("/projects/all").then((res) => {
      setProjects(res.data.projects);
    });
  }, [user]);

  // ================= Logout =================
  const handleLogout = async () => {
    await axios.post("/users/logout");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="h-screen w-full bg-gray-100 flex overflow-hidden">

      {/* ================= LEFT ICON SIDEBAR ================= */}
      <aside className="w-20 bg-indigo-900 text-white flex flex-col items-center py-6 gap-8">
        <div className="text-lg font-bold">AI</div>

        <nav className="flex flex-col gap-6 text-indigo-200">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activeView === "dashboard"
                ? "bg-indigo-700"
                : "hover:bg-indigo-800"
            }`}
          >
            🏠
          </button>

          <button
            onClick={() => setActiveView("profile")}
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activeView === "profile"
                ? "bg-indigo-700"
                : "hover:bg-indigo-800"
            }`}
          >
            👤
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto w-10 h-10 rounded-lg hover:bg-indigo-800 flex items-center justify-center"
        >
          🚪
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-6 overflow-y-auto">

        {/* ================= TOP BAR ================= */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            {activeView === "dashboard" ? "Ongoing Projects" : "Profile"}
          </h1>

          <div className="flex items-center gap-4">
            <input
              placeholder="Search"
              className="px-4 py-2 rounded-lg border text-sm"
            />
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              🔔
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-indigo-500"></div>
              <span className="text-sm font-medium">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* ================= DASHBOARD ================= */}
        {activeView === "dashboard" && (
          <>
            {/* ===== PROJECT CARDS ===== */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {projects.slice(0, 4).map((p) => (
                <div key={p._id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-sm font-semibold mb-2">{p.name}</div>
                  <div className="text-xs text-gray-500 mb-4">
                    Collaborators: {p.collaborators?.length || 1}
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full w-[70%] bg-indigo-500 rounded-full"></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-2">
                    70%
                  </div>
                </div>
              ))}
            </div>

            {/* ===== BUILD STREAM ===== */}
            <div className="max-w-4xl mb-10">
              <h2 className="text-lg font-semibold mb-4">Build Stream</h2>

              <div className="space-y-4">
                {buildEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl p-4 shadow-sm flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                      {event.actor.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{event.actor}</span>{" "}
                        {event.action}{" "}
                        <span className="font-semibold text-indigo-600">
                          {event.target}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== PROJECT LIST ===== */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold mb-4">Project List</h2>

              <table className="w-full text-sm">
                <thead className="text-gray-500">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => (
                    <tr
                      key={p._id}
                      className="border-t cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/project/${p._id}`)}
                    >
                      <td className="py-2">{i + 1}</td>
                      <td>{p.name}</td>
                      <td>
                        <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-600">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= PROFILE ================= */}
        {activeView === "profile" && <Profile />}
      </main>

      {/* ================= RIGHT PANEL ================= */}
      <aside className="w-80 bg-gray-50 border-l p-6">
        <h3 className="font-semibold mb-4">April 2021</h3>

        <div className="grid grid-cols-7 gap-2 text-xs mb-6">
          {["S","M","T","W","T","F","S"].map(d => (
            <div key={d} className="text-center text-gray-400">{d}</div>
          ))}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`text-center p-2 rounded-full ${
                i === 5 ? "bg-indigo-500 text-white" : "hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <h4 className="font-semibold mb-3">Meetings</h4>

        <div className="bg-white rounded-xl p-4 mb-3 shadow-sm border-l-4 border-orange-400">
          Project Overview
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500">
          Client Discussion
        </div>
      </aside>

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectName={projectName}
        setProjectName={setProjectName}
        onSubmit={createProject}
      />
    </div>
  );
};

export default Home;
