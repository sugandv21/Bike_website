import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const TEAL = "#0f4b56";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [imgUrl, setImgUrl] = useState(null);
  const [loadingImg, setLoadingImg] = useState(true);

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
  });
  const [busy, setBusy] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ title: "", message: "", isError: false });

  useEffect(() => {
    let mounted = true;
    setLoadingImg(true);
    axios
      .get(`${API_BASE}/auth/image/`)
      .then((r) => {
        if (mounted) setImgUrl(r.data.image_url);
      })
      .catch((e) => {
        console.warn("no auth image", e);
      })
      .finally(() => mounted && setLoadingImg(false));
    return () => (mounted = false);
  }, []);

  function showModal(title, message, isError = false) {
    setModalInfo({ title, message, isError });
    setModalOpen(true);
  }

  function onLoginChange(e) {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  }
  function onSignupChange(e) {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  }

  // Client-side signup validation
  function validateSignup() {
    const { username, email, password, confirm_password } = signupData;
    if (!username || !username.trim()) return "Please enter a username.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email.";
    if (!password || password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm_password) return "Password and Confirm Password do not match.";
    return null;
  }

  async function submitLogin(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await axios.post(`${API_BASE}/auth/login/`, loginData, { withCredentials: true });
      // successful login -> redirect to homepage
      // you can change '/' to your app's homepage route
      window.location.href = "/";
    } catch (err) {
      // parse message for helpful UX
      const resp = err?.response;
      const msg =
        (resp && (resp.data?.detail || (typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data)))) ||
        "Login failed";

      // If login fails, assume user not registered -> redirect to signup flow
      // (If you want precise detection, add an endpoint to check user existence)
      showModal("Not registered — please sign up", "We couldn't log you in. You can create an account now. We've moved you to the signup form and prefilled the username.", false);

      // move to signup and prefill username/email (if email present in server error, unlikely)
      setMode("signup");
      setSignupData((s) => ({
        ...s,
        username: loginData.username || s.username,
        email: s.email, // leave existing email if any
      }));
    } finally {
      setBusy(false);
    }
  }

  async function submitSignup(e) {
    e.preventDefault();

    const validationError = validateSignup();
    if (validationError) {
      showModal("Validation error", validationError, true);
      return;
    }

    setBusy(true);
    try {
      // send minimal signup payload (ensure backend expects these fields)
      await axios.post(`${API_BASE}/auth/register/`, {
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
        first_name: signupData.first_name,
        last_name: signupData.last_name,
      });

      showModal("Registered", "Your account was created. Please log in now.", false);

      // switch to login and prefill username
      setMode("login");
      setLoginData({ username: signupData.username, password: "" });
      // clear confirm password for cleanliness
      setSignupData((s) => ({ ...s, password: "", confirm_password: "" }));
    } catch (err) {
      const resp = err?.response;
      const errMsg =
        (resp && (resp.data?.detail || (typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data)))) ||
        "Signup failed";
      showModal("Signup failed", errMsg, true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="max-w-[1100px] mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-center">
          <div className="flex items-center justify-center">
            <div className="rounded-[28px] p-2 sm:p-4 w-[90%] lg:w-full" style={{ backgroundColor: TEAL }}>
              <div className="rounded-[18px] overflow-hidden">
                {imgUrl ? (
                  <img src={imgUrl} alt="auth" className="w-full h-[420px] sm:h-[420px] object-cover block" />
                ) : (
                  <div className="w-full h-[420px] flex items-center justify-center bg-gray-100 text-gray-600">No image</div>
                )}
              </div>
            </div>
          </div>
          <div className="px-1 sm:px-4">
            <h2 className="text-center text-[22px] font-semibold" style={{ color: TEAL }}>
              {mode === "login" ? "Log in" : "Create Account"}
            </h2>
            {mode === "login" ? (
              <form onSubmit={submitLogin} className="mt-4">
                <div className="mb-3">
                  <div className="mb-2 text-sm font-semibold" style={{ color: TEAL }}>User Name</div>
                  <input
                    name="username"
                    value={loginData.username}
                    onChange={onLoginChange}
                    placeholder="Username"
                    className="w-full rounded-full px-6 py-3 bg-[#0f4b56] text-white placeholder-white/80 focus:outline-none"
                  />
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold" style={{ color: TEAL }}>Password</div>
                  <input
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={onLoginChange}
                    placeholder="Password"
                    className="w-full rounded-full px-6 py-3 bg-[#0f4b56] text-white placeholder-white/80 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 mt-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-[#0f4b56] underline text-sm bg-transparent px-1 py-1"
                  >
                    Create new account
                  </button>

                  <div className="flex-1" />

                  <button
                    type="button"
                    onClick={() => showModal("Forgot password", "Password reset flow is not implemented in this demo.", false)}
                    className="text-[#0f4b56] underline text-sm bg-transparent px-1 py-1"
                  >
                    Forgot Password
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-[18px] py-3 text-lg text-white"
                    style={{ backgroundColor: TEAL }}
                  >
                    {busy ? "Please wait..." : "Log in"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={submitSignup} className="mt-4">
                <div className="mb-3">
                  <div className="mb-2 text-sm font-semibold" style={{ color: TEAL }}>User Name</div>
                  <input
                    name="username"
                    value={signupData.username}
                    onChange={onSignupChange}
                    placeholder="Choose username"
                    className="w-full rounded-full px-6 py-3 bg-[#0f4b56] text-white placeholder-white/80 focus:outline-none"
                  />
                </div>

                <div className="mb-3">
                  <div className="mb-2 text-sm font-semibold" style={{ color: TEAL }}>Email</div>
                  <input
                    name="email"
                    value={signupData.email}
                    onChange={onSignupChange}
                    placeholder="Enter email"
                    className="w-full rounded-full px-6 py-3 bg-[#0f4b56] text-white placeholder-white/80 focus:outline-none"
                  />
                </div>

                <div className="mb-3">
                  <div className="mb-2 text-sm font-semibold" style={{ color: TEAL }}>Password</div>
                  <input
                    name="password"
                    value={signupData.password}
                    onChange={onSignupChange}
                    type="password"
                    placeholder="Choose password (min 8 chars)"
                    className="w-full rounded-full px-6 py-3 bg-[#0f4b56] text-white placeholder-white/80 focus:outline-none"
                  />
                </div>

                <div className="mb-3">
                  <div className="mb-2 text-sm font-semibold" style={{ color: TEAL }}>Confirm Password</div>
                  <input
                    name="confirm_password"
                    value={signupData.confirm_password}
                    onChange={onSignupChange}
                    type="password"
                    placeholder="Confirm password"
                    className="w-full rounded-full px-6 py-3 bg-[#0f4b56] text-white placeholder-white/80 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 mb-3">
                  <input
                    name="first_name"
                    value={signupData.first_name}
                    onChange={onSignupChange}
                    placeholder="First name"
                    className="flex-1 rounded-full px-6 py-3 bg-[#0f4b56] text-white placeholder-white/80 focus:outline-none"
                  />
                  <input
                    name="last_name"
                    value={signupData.last_name}
                    onChange={onSignupChange}
                    placeholder="Last name"
                    className="flex-1 rounded-full px-6 py-3 bg-[#0f4b56] text-white placeholder-white/80 focus:outline-none"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-[18px] py-3 text-lg text-white"
                    style={{ backgroundColor: TEAL }}
                  >
                    {busy ? "Creating..." : "Create Account"}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <span>Already have account? </span>
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-[#0f4b56] underline ml-2 bg-transparent px-1 py-1"
                  >
                    Log in
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-lg p-5 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold" style={{ color: TEAL }}>{modalInfo.title}</h3>
            <p className={`mt-3 ${modalInfo.isError ? "text-red-600" : "text-gray-700"}`}>{modalInfo.message}</p>
            <div className="flex justify-end mt-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md text-white" style={{ backgroundColor: TEAL }}>OK</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
