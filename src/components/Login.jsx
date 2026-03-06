import { useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

export default function Login() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoginError, setIsLoginError] = useState(false);
  const emailRef = useRef(null);
  const passRef = useRef(null);
  const { user, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  async function onLogin(event) {
    event.preventDefault();
    setIsLoggingIn(true);
    setIsLoginError(false);

    const email = emailRef.current?.value || "";
    const password = passRef.current?.value || "";
    const isSuccess = await login(email, password);

    setIsLoggingIn(false);
    setIsLoginError(!isSuccess);

    if (isSuccess) {
      const from = location.state?.from?.pathname || "/books";
      navigate(from, { replace: true });
    }
  }

  if (user.isLoading) return <div>Loading session...</div>;
  if (user.isLoggedIn) return <Navigate to="/books" replace />;

  return (
    <div>
      <h2>Library Login</h2>
      <p>Use `admin@test.com` / `admin123` or `user@test.com` / `user123`.</p>

      <form onSubmit={onLogin}>
        <table>
          <tbody>
            <tr>
              <th>Email</th>
              <td>
                <input type="email" name="email" id="email" ref={emailRef} required />
              </td>
            </tr>
            <tr>
              <th>Password</th>
              <td>
                <input type="password" name="password" id="password" ref={passRef} required />
              </td>
            </tr>
          </tbody>
        </table>
        <button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? "Logging in..." : "Login"}
        </button>
      </form>

      {isLoginError && <div>Login incorrect</div>}
    </div>
  );
}
