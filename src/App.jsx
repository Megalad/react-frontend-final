import "./App.css";
import { Navigate, Outlet, Route, Routes, Link } from "react-router-dom";
import BookBorrow from "./components/BookBorrow";
import { BookDetail } from "./components/BookDetail";
import Books from "./components/Books";
// import { Items } from './components/Items';
// import { ItemDetail } from './components/ItemDetail';
import Login from "./components/Login";
import Logout from "./components/Logout";
import Profile from "./components/Profile";
import { useUser } from "./contexts/UserProvider";
import RequireAuth from "./middleware/RequireAuth";

function ProtectedLayout() {
  const { user } = useUser();

  if (user.isLoading) {
    return <div>Loading session...</div>;
  }

  return (
    <div>
      <nav>
        <Link to="/books">Books</Link> |{" "}
        {user.role === "USER" && <Link to="/borrow">My Requests</Link>}
        {user.role === "ADMIN" && <Link to="/borrow">Manage Requests</Link>}
        {" | "}<Link to="/profile">Profile</Link> | <Link to="/logout">Logout</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

function RootRedirect() {
  const { user } = useUser();

  if (user.isLoading) return <div>Loading session...</div>;
  return <Navigate to={user.isLoggedIn ? "/books" : "/login"} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <ProtectedLayout />
          </RequireAuth>
        }
      >
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/borrow" element={<BookBorrow />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logout" element={<Logout />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
