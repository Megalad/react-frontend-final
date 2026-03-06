import { useEffect, useMemo, useState } from "react";
import { useUser } from "../contexts/UserProvider";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function apiUrl(path) {
  return `${API_URL}${path}`;
}

export default function BookBorrow() {
  //TODO: Implement your book request service here
  const { user } = useUser();
  const isAdmin = useMemo(() => user.role === "ADMIN", [user.role]);
  const isUser = useMemo(() => user.role === "USER", [user.role]);

  const [books, setBooks] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    bookId: "",
    targetDate: "",
  });

  async function loadBooks() {
    const response = await fetch(apiUrl("/api/books"), {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
      setBooks(data.books || []);
    }
  }

  async function loadBorrowRecords() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/api/borrow"), {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to load borrow requests");
        return;
      }
      setRecords(data.borrows || []);
    } catch {
      setError("Failed to load borrow requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBorrowRecords();
    if (isUser) {
      loadBooks();
    }
  }, [isUser]);

  async function createBorrowRequest(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const response = await fetch(apiUrl("/api/borrow"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: form.bookId,
        targetDate: form.targetDate,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Failed to create request");
      return;
    }

    setMessage("Borrow request submitted");
    setForm({ bookId: "", targetDate: "" });
    await loadBorrowRecords();
  }

  async function updateRequestStatus(borrowId, requestStatus) {
    setError("");
    setMessage("");

    const response = await fetch(apiUrl("/api/borrow"), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ borrowId, requestStatus }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Failed to update request");
      return;
    }

    setMessage("Request updated");
    await loadBorrowRecords();
  }

  if (loading) return <div>Loading borrow requests...</div>;

  return (
    <div>
      <h2>{isAdmin ? "Borrow Request Management" : "My Borrow Requests"}</h2>
      {message && <div>{message}</div>}
      {error && <div>{error}</div>}

      {isUser && (
        <form onSubmit={createBorrowRequest}>
          <h3>Create Request</h3>
          <select
            value={form.bookId}
            onChange={(event) => setForm((prev) => ({ ...prev, bookId: event.target.value }))}
            required
          >
            <option value="">Select book</option>
            {books.map((book) => (
              <option key={book._id} value={book._id}>
                {book.title} - {book.author}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.targetDate}
            onChange={(event) => setForm((prev) => ({ ...prev, targetDate: event.target.value }))}
            required
          />
          <button type="submit">Submit Request</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Book</th>
            <th>User</th>
            <th>Created At</th>
            <th>Target Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record._id}>
              <td>{record.bookTitle}</td>
              <td>{record.userEmail}</td>
              <td>{new Date(record.createdAt).toLocaleString()}</td>
              <td>{new Date(record.targetDate).toLocaleDateString()}</td>
              <td>{record.requestStatus}</td>
              <td>
                {isAdmin && record.requestStatus === "INIT" && (
                  <>
                    <button onClick={() => updateRequestStatus(record._id, "ACCEPTED")}>Accept</button>
                    <button onClick={() => updateRequestStatus(record._id, "CANCEL-ADMIN")}>
                      Cancel (Admin)
                    </button>
                  </>
                )}

                {isAdmin && record.requestStatus === "ACCEPTED" && (
                  <button onClick={() => updateRequestStatus(record._id, "CANCEL-ADMIN")}>
                    Cancel (Admin)
                  </button>
                )}

                {isUser && ["INIT", "ACCEPTED"].includes(record.requestStatus) && (
                  <button onClick={() => updateRequestStatus(record._id, "CANCEL-USER")}>
                    Cancel (User)
                  </button>
                )}
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan="6">No borrow requests found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
