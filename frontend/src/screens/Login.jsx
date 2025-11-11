// ------------------------------------------------------------
// Import React and required hooks
// ------------------------------------------------------------
import React, { useState, useContext } from 'react'
// useState → for managing input states (email, password)
// useContext → to access and update the global user context

// ------------------------------------------------------------
// Import router utilities
// ------------------------------------------------------------
import { Link, useNavigate } from 'react-router-dom'
// Link → allows navigation between pages without page reload
// useNavigate → used to programmatically redirect users after login

// ------------------------------------------------------------
// Import Axios instance and Context
// ------------------------------------------------------------
import axios from '../config/axios'
// axios → handles HTTP requests to your backend API (e.g. POST /users/login)

import { UserContext } from '../context/user.context'
// UserContext → global context that stores the logged-in user's data

// ------------------------------------------------------------
// Login Component
// ------------------------------------------------------------
const Login = () => {

    // Local states for form input values
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Get setUser function from UserContext to update global user info after login
    const { setUser } = useContext(UserContext)

    // useNavigate hook gives navigation control (redirect after successful login)
    const navigate = useNavigate()

    // ------------------------------------------------------------
    // Handles form submission
    // ------------------------------------------------------------
    function submitHandler(e) {
        e.preventDefault() // Prevents page reload on form submit

        // Send login request to backend API using Axios
        axios.post('/users/login', {
            email,     // email from input field
            password,  // password from input field
        })
        .then((res) => {
            console.log(res.data) // For debugging: shows backend response in console

            // ✅ Save token (for authentication) and user (for session data) in localStorage
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))

            // ✅ Update global context (so rest of app knows user is logged in)
            setUser(res.data.user)

            // ✅ Redirect to homepage after successful login
            navigate('/')
        })
        .catch((err) => {
            // ❌ If login fails, show error info in console
            console.log(err.response?.data || err)
        })
    }

    // ------------------------------------------------------------
    // UI Rendering Section (JSX)
    // ------------------------------------------------------------
    return (
        // Outer wrapper for full-screen centered login box
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            {/* Login Card */}
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

                {/* Form Section */}
                <form onSubmit={submitHandler}>
                    {/* ---------------- Email Input ---------------- */}
                    <div className="mb-4">
                        <label
                            className="block text-gray-400 mb-2"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            onChange={(e) => setEmail(e.target.value)} // store email input
                            type="email"
                            id="email"
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required // ensures the field isn’t empty
                        />
                    </div>

                    {/* ---------------- Password Input ---------------- */}
                    <div className="mb-6">
                        <label
                            className="block text-gray-400 mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            onChange={(e) => setPassword(e.target.value)} // store password input
                            type="password"
                            id="password"
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {/* ---------------- Submit Button ---------------- */}
                    <button
                        type="submit"
                        className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Login
                    </button>
                </form>

                {/* ---------------- Register Link ---------------- */}
                <p className="text-gray-400 mt-4">
                    Don&apos;t have an account?{' '}
                    <Link
                        to="/register"
                        className="text-blue-500 hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}

// Export component for use in router (App.jsx)
export default Login
