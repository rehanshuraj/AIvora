import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer, disposeWebContainer } from '../config/webContainer.js'

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}

const Project = () => {
  const location = useLocation()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState('')
  const { user } = useContext(UserContext)
  const messageBox = useRef()

  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])

  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)
  const [loadingContainer, setLoadingContainer] = useState(true)

  const handleUserClick = (id) => {
    setSelectedUserId((prev) => {
      const newSet = new Set(prev)
      newSet.has(id) ? newSet.delete(id) : newSet.add(id)
      return newSet
    })
  }

  const addCollaborators = () => {
    axios
      .put(
        '/projects/add-user',
        {
          projectId: location.state.project._id,
          users: Array.from(selectedUserId),
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((res) => {
        console.log(res.data)
        setIsModalOpen(false)
      })
      .catch((err) => console.log(err))
  }

  const send = () => {
    sendMessage('project-message', { message, sender: user })
    setMessages((prev) => [...prev, { sender: user, message }])
    setMessage('')
  }

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message)
    return (
      <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    )
  }

  useEffect(() => {
    initializeSocket(project._id)

    getWebContainer()
      .then((container) => {
        if (!container) {
          console.error('WebContainer failed to initialize.')
          return
        }
        setWebContainer(container)
        setLoadingContainer(false)
        console.log('WebContainer started')
      })
      .catch((err) => {
        console.error('Error starting WebContainer:', err)
        setLoadingContainer(false)
      })

    receiveMessage('project-message', (data) => {
      console.log(data)
      if (data.sender._id === 'ai') {
        const message = JSON.parse(data.message)
        if (webContainer && message.fileTree) {
          webContainer.mount(message.fileTree)
        }
        if (message.fileTree) setFileTree(message.fileTree || {})
        setMessages((prev) => [...prev, data])
      } else setMessages((prev) => [...prev, data])
    })

    axios.get(`/projects/get-project/${location.state.project._id}`).then((res) => {
      setProject(res.data.project)
      setFileTree(res.data.project.fileTree || {})
    })

    axios
      .get('/users/all')
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.log(err))

    return () => {
      disposeWebContainer() // cleanup
    }
  }, [])

  function saveFileTree(ft) {
    axios
      .put('/projects/update-file-tree', {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err))
  }

  return (
    <main className="h-screen w-screen flex">
      {/* LEFT SIDE - CHAT */}
      <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0">
          <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborator</p>
          </button>
          <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2">
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
          <div
            ref={messageBox}
            className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-52'} ${
                  msg.sender._id == user._id.toString() && 'ml-auto'
                } message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}
              >
                <small className="opacity-65 text-xs">{msg.sender.email}</small>
                <div className="text-sm">
                  {msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : <p>{msg.message}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="inputField w-full flex absolute bottom-0">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 px-4 border-none outline-none flex-grow"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className="px-5 bg-slate-950 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE - CODE EDITOR */}
      <section className="right bg-red-50 flex-grow h-full flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
          <div className="file-tree w-full">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile(file)
                  setOpenFiles([...new Set([...openFiles, file])])
                }}
                className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full"
              >
                <p className="font-semibold text-lg">{file}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full shrink">
          <div className="top flex justify-between w-full">
            <div className="files flex">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${
                    currentFile === file ? 'bg-slate-400' : ''
                  }`}
                >
                  <p className="font-semibold text-lg">{file}</p>
                </button>
              ))}
            </div>

            {/* ✅ SAFE RUN BUTTON */}
            <div className="actions flex gap-2">
              <button
                disabled={loadingContainer}
                onClick={async () => {
                  if (!webContainer) {
                    console.warn('WebContainer not initialized yet, waiting...')
                    setTimeout(() => {
                      alert('WebContainer is still loading... please try again in a few seconds.')
                    }, 500)
                    return
                  }

                  if (!fileTree || Object.keys(fileTree).length === 0) {
                    alert('No files to run. Please add or open a file first.')
                    return
                  }

                  try {
                    await webContainer.mount(fileTree)
                    console.log('Files mounted successfully')

                    const installProcess = await webContainer.spawn('npm', ['install'])
                    installProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log(chunk)
                        },
                      })
                    )

                    if (runProcess) runProcess.kill()

                    const tempRunProcess = await webContainer.spawn('npm', ['start'])
                    tempRunProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log(chunk)
                        },
                      })
                    )

                    setRunProcess(tempRunProcess)

                    webContainer.on('server-ready', (port, url) => {
                      console.log('Server ready:', port, url)
                      setIframeUrl(url)
                    })
                  } catch (error) {
                    console.error('Error running project:', error)
                    alert('Failed to run the project. Check console for details.')
                  }
                }}
                className={`p-2 px-4 rounded-lg text-white ${
                  loadingContainer ? 'bg-slate-500' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {loadingContainer ? 'Loading...' : 'Run'}
              </button>
            </div>
          </div>

          <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
            {fileTree[currentFile] && (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                <pre className="hljs h-full">
                  <code
                    className="hljs h-full outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: { contents: updatedContent },
                        },
                      }
                      setFileTree(ft)
                      saveFileTree(ft)
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(fileTree[currentFile].file.contents, {
                        language: 'javascript',
                      }).value,
                    }}
                    style={{
                      whiteSpace: 'pre-wrap',
                      paddingBottom: '25rem',
                    }}
                  />
                </pre>
              </div>
            )}
          </div>
        </div>

        {iframeUrl && webContainer && (
          <div className="flex min-w-96 flex-col h-full">
            <div className="address-bar">
              <input
                type="text"
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl}
                className="w-full p-2 px-4 bg-slate-200"
              />
            </div>
            <iframe src={iframeUrl} className="w-full h-full"></iframe>
          </div>
        )}
      </section>
    </main>
  )
}

export default Project
