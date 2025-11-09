import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [totalCollaborators, setTotalCollaborators] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    }
  };

  // Exit project 
  const handleExitProject = async (projectId) => {
    if (!window.confirm("Do you really want to exit this project?")) return;
        
    try {
      await axios.post(`/projects/${projectId}/exit`);
      setProject((prev) => prev.filter((p) => p._id !== projectId));
    } catch (error) {
      console.error("Error exiting project:", error);
      alert("Failed to exit project. Try again later.");
    }
  };

  // Create project
  async function createProject(e) {
    e.preventDefault();
    setErrorMsg("");
    setIsCreating(true);

    try {
      const res = await axios.post("/projects/create", { name: projectName });
      console.log(res.data);

      // Refresh project list after creation
      const updatedProjects = await axios.get("/projects/all");
      setProject(updatedProjects.data.projects || []);

      setIsModalOpen(false);
      setProjectName("");
    } catch (error) {
      console.error("Error creating project:", error);
      if (error.response?.status === 400) {
        setErrorMsg(error.response.data || "Project name must be unique.");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  }

  // Fetch projects & calculate collaborator data
  useEffect(() => {
    axios
      .get("/projects/all")
      .then((res) => {
        const allProjects = res.data.projects || [];
        setProject(allProjects);

        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        const uniqueUserIds = new Set();
        const monthlyUserSets = Array.from({ length: 12 }, () => new Set());

        allProjects.forEach((proj) => {
          proj.users?.forEach((user) => {
            const userId =
              typeof user === "string"
                ? user
                : user._id || user.id || user.email || user.username;

            if (userId) {
              uniqueUserIds.add(userId);

              const date = user.lastActive || user.createdAt;
              let monthIndex;
              if (date) monthIndex = dayjs(date).month();
              else monthIndex = Math.floor(Math.random() * 12);

              monthlyUserSets[monthIndex].add(userId);
            }
          });
        });

        const formatted = months.map((m, i) => ({
          name: m,
          value: monthlyUserSets[i].size,
        }));

        setChartData(formatted);
        setTotalCollaborators(uniqueUserIds.size);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <main className="relative min-h-screen text-gray-900 font-inter overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/vedioes/windmill.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-white/20 to-transparent z-0"></div>

      {/* Floating Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex justify-center mt-28"
      >
        <div className="backdrop-blur-2xl bg-white/60 rounded-2xl shadow-2xl border border-white/40 p-6 w-[90%] sm:w-[700px] max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Dashboard</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg shadow transition-all"
            >
              Logout
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Welcome back, {user?._user || "User"}!
          </p>

          {/* Projects Section */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {project.map((p) => (
              <motion.div
                key={p._id}
                whileHover={{ scale: 1.03 }}
                className="relative p-4 bg-white/70 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
              >
                {/* Exit Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent project navigation
                    handleExitProject(p._id);
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full transition"
                >
                  Exit
                </button>

                {/* Project Info */}
                <div onClick={() => navigate(`/project`, { state: { project: p } })}>
                  <h3 className="font-semibold text-gray-800 mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <i className="ri-user-line"></i> {p.users.length} Collaborators
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Add Project Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center"
            >
              + New Project
            </button>
          </div>

          {/* Chart Section */}
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Section */}
          <div className="flex justify-between items-center mt-4 text-gray-600 text-sm">
            <p>
              <span className="text-xl font-semibold text-gray-800">
                {totalCollaborators}
              </span>{" "}
              total active collaborators
            </p>
            <p>Usage Overview</p>
          </div>
        </div>
      </motion.div>

      {/* Modal for New Project */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] sm:w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
            <form onSubmit={createProject} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
                required
              />

              {errorMsg && (
                <p className="text-red-500 text-sm -mt-2">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-all"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-md ${
                    isCreating
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500"
                  } transition-all`}
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
