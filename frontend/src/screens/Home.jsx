import React, { useContext, useState } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import axios from '../config/axios'
import CreateProjectModal from "../components/CreateProjectModal";

const Home = () => {

    const { user,setUser } = useContext(UserContext)
    


    const [isCreateOpen,setIsCreateOpen]=useState(false);
    const [projectName,setProjectName] = useState(null);
    const [project,setProject] = useState([]);

    const navigate = useNavigate()
    
    async function createProject(e){
      e.preventDefault();

      //safety check(frontend validation)
      if(!projectName.trim()){
        alert("project name required")
        return;
      }
      try{
        const res=await axios.post("projects/create",{
          name:projectName,
        });
        console.log(res.data);
        alert("project created successfully");
      }
      catch(error){
        //backend error (like duplicate project name)
        if(error.response){
          console.error(error.reponse.data);
          alert(error.response.data); //like project name must be unique
        }
        else{
          console.error(error);
          alert("something went wrong.try again later");
        }
      }
    }
    useEffect(()=>{
      axios.get('/projects/all').then((res)=>{
        setProject(res.data.projects)
      }).catch(err=>{
        console.log(err)
      })
    },[user])//runs only once on page load

    //handle logout
    const handleLogout = async ()=>{
      if(window.confirm("Are you sure you want to logout?")){
        await axios.post("/users/logout");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/Login");
      }
    };

    // Dummy UI data (replace later with real data)
    const buildEvents = [
        {
            id: 1,
            actor: "Rehan",
            action: "created a new project",
            target: "PR5",
            time: "2 min ago"
        },
        {
            id: 2,
            actor: "Diya",
            action: "joined project",
            target: "PR9",
            time: "10 min ago"
        },
        {
            id: 3,
            actor: "Rehan",
            action: "created file",
            target: "index.js",
            time: "30 min ago"
        }
    ]

    const projects = [
        { id: 1, name: "PR5", collaborators: 1 },
        { id: 2, name: "PR9", collaborators: 1 }
    ]

    return (
        <main className="h-screen flex bg-gray-100">

            {/* ================= Sidebar ================= */}
            <aside className="w-56 bg-white border-r p-4 flex flex-col gap-4">
                <h1 className="text-xl font-bold">AIvora</h1>

                <nav className="flex flex-col gap-2 text-sm">
                    <button className="text-left px-3 py-2 rounded hover:bg-gray-200 font-medium">
                        Dashboard
                    </button>
                    <button className="text-left px-3 py-2 rounded hover:bg-gray-200">
                        Projects
                    </button>
                    <button className="text-left px-3 py-2 rounded hover:bg-gray-200">
                        Friends
                    </button>
                    <button className="text-left px-3 py-2 rounded hover:bg-gray-200">
                        Profile
                    </button>
                </nav>

                <div className="mt-auto flex flex-col gap-3">

                {/* User Info */}
              <div className="text-sm text-gray-500">
                    Logged in as <br />
                    <span className="font-medium">{user?.email}</span>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50"
                >
                    Logout
                </button>

              </div>

            </aside>

            {/* ================= Build Stream ================= */}
            <section className="flex-1 p-6 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Build Stream</h2>

                <div className="flex flex-col gap-4">
                    {buildEvents.map(event => (
                        <div
                            key={event.id}
                            className="bg-white p-4 rounded-md border hover:shadow-sm transition"
                        >
                            <p className="text-sm">
                                <span className="font-semibold">{event.actor}</span>{" "}
                                {event.action}{" "}
                                <span className="font-semibold">{event.target}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{event.time}</p>

                            <div className="mt-3 flex gap-3">
                                <button className="text-xs px-3 py-1 border rounded hover:bg-gray-100">
                                    View
                                </button>
                                <button className="text-xs px-3 py-1 border rounded hover:bg-gray-100">
                                    Open Project
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= Projects Panel ================= */}
            <aside className="w-72 bg-white border-l p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Your Projects</h3>
                    <button
                        onClick={()=>setIsCreateOpen(true)}
                        className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
                    >
                        + New
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => navigate("/project")}
                            className="cursor-pointer p-3 border rounded hover:bg-gray-100"
                        >
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                                Collaborators: {project.collaborators}
                            </p>
                        </div>
                    ))}
                </div>
            </aside>


            {/* ================= Create Project Modal ================= */}
            <CreateProjectModal
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
              projectName={projectName}
              setProjectName={setProjectName}
              onSubmit={createProject}
            />

        </main>
    )
}

export default Home
