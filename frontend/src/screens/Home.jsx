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
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const [chartData, setChartData] = useState([]);

  const navigate = useNavigate();

  // Create project
  function createProject(e) {
    e.preventDefault();
    axios
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Fetch projects & calculate monthly collaborator activity
  useEffect(() => {
    axios
      .get("/projects/all")
      .then((res) => {
        const allProjects = res.data.projects || [];
        setProject(allProjects);

        // Month labels
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const monthlyUsage = new Array(12).fill(0);

        allProjects.forEach((proj) => {
          proj.users?.forEach((user) => {
            // Use lastActive or createdAt; fallback to random month if not available
            const date = user.lastActive || user.createdAt;
            let monthIndex;
            if (date) monthIndex = dayjs(date).month();
            else monthIndex = Math.floor(Math.random() * 12);
            monthlyUsage[monthIndex] += 1;
          });
        });

        const formatted = months.map((m, i) => ({
          name: m,
          value: monthlyUsage[i],
        }));
        setChartData(formatted);
      })
      .catch((err) => {
        console.log(err);
      });
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
            <h2 className="text-lg font-semibold">Scope emissions</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-all"
            >
              New
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Scope 1 — Direct emissions
          </p>

          {/* Projects Section */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {project.map((p) => (
              <motion.div
                key={p._id}
                whileHover={{ scale: 1.03 }}
                onClick={() => navigate(`/project`, { state: { project: p } })}
                className="p-4 bg-white/70 rounded-lg shadow-md cursor-pointer border border-gray-200 hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-gray-800 mb-1">{p.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <i className="ri-user-line"></i> {p.users.length} Collaborators
                </p>
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
                {chartData.reduce((a, b) => a + b.value, 0)}
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
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Create
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
