import { Link } from "react-router-dom";

export default function AuthForm({ isSignup, values, update, submit, loading, error, success }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isSignup ? "Create Account" : "Login"}</h2>
          <p>{isSignup ? "Join CodeCollab and start coding together." : "Please enter your details to login."}</p>
        </div>
        {error && <div className="alert error" role="alert">{error}</div>}
        {success && <div className="alert success" role="status">{success}</div>}
        <div className="social-actions">
          <button type="button" className="social-button google">Google</button>
          <button type="button" className="social-button apple">Apple</button>
        </div>
        <div className="divider"><span /><p>Or</p><span /></div>
        <form className="auth-form" onSubmit={submit}>
          {isSignup && <label>Full Name<input name="fullName" value={values.fullName} onChange={update} placeholder="Enter your full name" required /></label>}
          <label>Email<input type="email" name="email" value={values.email} onChange={update} placeholder="Enter your email" required /></label>
          <label>Password<input type="password" name="password" value={values.password} onChange={update} placeholder={isSignup ? "Create a password" : "Enter your password"} required /></label>
          {!isSignup && <div className="auth-row">
            <label className="checkbox-label"><input type="checkbox" name="rememberMe" checked={values.rememberMe} onChange={update} />Remember me</label>
            <a href="#" className="forgot-link">Forgot Password?</a>
          </div>}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (isSignup ? "Creating Account..." : "Logging in...") : (isSignup ? "Sign Up" : "Log In")}
          </button>
        </form>
        <p className="auth-footer">
          {isSignup ? "Already have an account? " : "Don’t have an account yet? "}
          <Link to={isSignup ? "/login" : "/signup"}>{isSignup ? "Log In" : "Sign Up"}</Link>
        </p>
      </div>
    </div>
  );
}
