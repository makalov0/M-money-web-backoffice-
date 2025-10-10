import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import appLogo from "../../assets/img/Ic_mmoneyx.jpg";

const LoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!identifier || !password) {
            setError("Please enter username/email and password.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post("/api/login", {
                identifier,
                password,
            });
            // ✅ เก็บ token
            localStorage.setItem("token", res.data.token);
            // ✅ แจ้งเตือน success ก่อน redirect
            setSuccess("Login successful! Redirecting...");
            setTimeout(() => {
                navigate("/"); // ใช้ react-router redirect
            }, 1200);
        } catch (err) {
            console.error(err);
            setError("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                {/* <img
                    src={appLogo}
                    alt="App Logo"
                    className="mx-auto mb-6 h-20 object-contain boder-rounded-lg"
                /> */}
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Login
                </h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Username/Email */}
                    <input
                        type="text"
                        placeholder="Username or Email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    {/* Password */}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 text-sm rounded bg-red-100 text-red-700 border border-red-300 text-center">
                            {error}
                        </div>
                    )}
                    {/* Success Message */}
                    {success && (
                        <div className="p-3 text-sm rounded bg-green-100 text-green-700 border border-green-300 text-center">
                            {success}
                        </div>
                    )}
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center justify-center"
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
                            </svg>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
