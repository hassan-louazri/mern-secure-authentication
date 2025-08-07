import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
    const navigate = useNavigate();
    const { serverUrl, setIsLoggedIn, getUserData } = useContext(AppContext);
    const [state, setState] = useState("Register");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            axios.defaults.withCredentials = true;
            if (state === "Register") {
                const { data } = await axios.post(
                    serverUrl + "/api/auth/register",
                    { name, email, password }
                );
                if (data.success) {
                    setIsLoggedIn(true);
                    getUserData();
                    navigate("/");
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post(
                    serverUrl + "/api/auth/login",
                    { email, password }
                );
                if (data.success) {
                    setIsLoggedIn(true);
                    getUserData();
                    navigate("/");
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    return (
        <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
            <img
                src={assets.logo}
                onClick={() => navigate("/")}
                className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
                alt=""
            />
            <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
                <h2 className="text-3xl font-semibold text-white text-center mb-3">
                    {state === "Register"
                        ? "Create your account."
                        : "Log in to your account."}
                </h2>
                <p className="text-center text-sm mb-6">
                    {state === "Register"
                        ? "Input a valid email and password to register your new account."
                        : "Submit your credentials to log in."}
                </p>

                <form onSubmit={onSubmitHandler}>
                    {state === "Register" && (
                        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                            <img src={assets.person_icon} alt="" />
                            <input
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                className="bg-transparent outline-none"
                                type="text"
                                placeholder="Enter your full name..."
                                required
                            />
                        </div>
                    )}

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img src={assets.mail_icon} alt="" />
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className="bg-transparent outline-none"
                            type="email"
                            placeholder="Enter your email address..."
                            required
                        />
                    </div>

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img src={assets.lock_icon} alt="" />
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className="bg-transparent outline-none"
                            type="password"
                            placeholder="Enter your password..."
                            required
                        />
                    </div>

                    <p
                        onClick={() => navigate("/reset-password")}
                        className="mb-4 text-indigo-500 cursor-pointer"
                    >
                        Forgot your password?
                    </p>

                    <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
                        {state}
                    </button>
                </form>

                {state === "Register" ? (
                    <p className="text-gray-400 text-center text-xs mt-4">
                        Already have an account?{" "}
                        <span
                            onClick={() => setState("Login")}
                            className="text-blue-400 cursor-pointer underline"
                        >
                            Login here
                        </span>
                    </p>
                ) : (
                    <p className="text-gray-400 text-center text-xs mt-4">
                        Don't have an account?{" "}
                        <span
                            onClick={() => setState("Register")}
                            className="text-blue-400 cursor-pointer underline"
                        >
                            Register
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
