import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { storeSession } from "../../services/auth";

export default function useAuthForm(isSignup) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: "", email: "", password: "", rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!values.email || !values.password || (isSignup && !values.fullName)) {
      setError("Please fill in all fields");
      return;
    }
    if (isSignup && values.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const path = isSignup ? "/users/add" : "/users/login";
      const body = isSignup
        ? { fullName: values.fullName, email: values.email, password: values.password }
        : { email: values.email, password: values.password };
      const data = await apiRequest(path, { method: "POST", body: JSON.stringify(body) });
      storeSession(data.user, isSignup ? data.token : data.token || data.user?.id);
      setSuccess(isSignup ? "Account created successfully! Redirecting to login..." : "Login successful! Redirecting...");
      window.setTimeout(() => navigate(isSignup ? "/login" : "/join-room"), isSignup ? 1500 : 700);
    } catch (requestError) {
      setError(requestError.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { values, update, submit, loading, error, success };
}
