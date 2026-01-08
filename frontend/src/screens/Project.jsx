import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { initializeSocket, receiveMessage, sendMessage } from "../config/socket";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webcontainer";

/* ================= Code Highlight ================= */
function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

/* ================= Project ================= */
const Project = () => {
  const { id } = useParams(); // ✅ SOURCE OF TRUTH
  const { user } = useContext(UserContext);

  const messageBox = useRef(null);

  /* ---------- STATE ---------- */
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());

  /* ================= FETCH PROJECT ================= */
  useEffect(() => {
    if (!id) return;

    axios
      .get(`/projects/get-project/${id}`)
      .then((res) => {
        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {});
      })
      .catch(console.error);

    axios
      .get("/users/all")
      .then((res) => setUsers(res.data.users))
      .catch(console.error);
  }, [id]);

  /* ================= SOCKET + WEB CONTAINER ================= */
  useEffect(() => {
    if (!project) return;

    initializeSocket(project._id);

    receiveMessage("project-message", (data) => {
      setMessages((prev) => [...prev, data]);

      if (data.sender?._id === "ai") {
        const parsed = JSON.parse(data.message);
        if (parsed.fileTree) {
          setFileTree(parsed.fileTree);
          webContainer?.mount(parsed.fileTree);
        }
      }
    });

    if (!webContainer) {
      getWebContainer().then(setWebContainer);
    }
  }, [project, webContainer]);

  /* ================= HELPERS ================= */
  const send = () => {
    if (!message.trim()) return;

    sendMessage("project-message", {
      message,
      sender: user,
    });

    setMessages((prev) => [...prev, { sender: user, message }]);
    setMessage("");
  };

  const saveFileTree = (ft) => {
    axios.put("/projects/update-file-tree", {
      projectId: project._id,
      fileTree: ft,
    });
  };

  /* ================= GUARD ================= */
  if (!project) {
    return <div className="p-10 text-lg">Loading project...</div>;
  }

  /* ================= RENDER ================= */
  return (
    <main className="h-screen w-screen flex">
      {/* ================= LEFT ================= */}
      <section className="w-96 flex flex-col bg-slate-300">
        <header className="p-2 bg-slate-100 flex justify-between">
          <button onClick={() => setIsModalOpen(true)}>Add collaborator</button>
          <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
            Users
          </button>
        </header>

        <div
          ref={messageBox}
          className="flex-grow overflow-auto p-2 flex flex-col gap-2"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded bg-white ${
                msg.sender?._id === user?._id ? "ml-auto" : ""
              }`}
            >
              <small>{msg.sender?.email}</small>
              {msg.sender?._id === "ai" ? (
                <Markdown
                  options={{ overrides: { code: SyntaxHighlightedCode } }}
                >
                  {JSON.parse(msg.message).text}
                </Markdown>
              ) : (
                <p>{msg.message}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-2"
            placeholder="Message"
          />
          <button onClick={send} className="px-4 bg-black text-white">
            Send
          </button>
        </div>
      </section>

      {/* ================= RIGHT ================= */}
      <section className="flex-grow flex">
        <aside className="w-56 bg-slate-200">
          {Object.keys(fileTree).map((file) => (
            <button
              key={file}
              onClick={() => {
                setCurrentFile(file);
                setOpenFiles((prev) => [...new Set([...prev, file])]);
              }}
              className="w-full p-2 text-left"
            >
              {file}
            </button>
          ))}
        </aside>

        <div className="flex-grow">
          {currentFile && (
            <pre className="h-full">
              <code
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{
                  __html: hljs.highlight(
                    "javascript",
                    fileTree[currentFile]?.file?.contents || ""
                  ).value,
                }}
                onBlur={(e) => {
                  const updated = {
                    ...fileTree,
                    [currentFile]: {
                      file: { contents: e.target.innerText },
                    },
                  };
                  setFileTree(updated);
                  saveFileTree(updated);
                }}
              />
            </pre>
          )}
        </div>

        {iframeUrl && (
          <iframe src={iframeUrl} className="w-96 h-full border-l" />
        )}
      </section>
    </main>
  );
};

export default Project;
