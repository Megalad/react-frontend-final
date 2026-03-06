import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function apiUrl(path) {
  return `${API_URL}${path}`;
}

export function BookDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const isAdmin = useMemo(() => user.role === "ADMIN", [user.role]);
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    location: "",
    quantity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadBook = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl(`/api/books/${id}`), {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to load book");
        setBook(null);
        return;
      }

      setBook(data.book);
      setForm({
        title: data.book.title,
        author: data.book.author,
        location: data.book.location,
        quantity: data.book.quantity,
      });
    } catch {
      setError("Failed to load book");
      setBook(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  async function updateBook(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const response = await fetch(apiUrl(`/api/books/${id}`), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        author: form.author,
        location: form.location,
        quantity: Number(form.quantity),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Update failed");
      return;
    }

    setMessage("Book updated");
    await loadBook();
  }

  async function deleteBook() {
    setError("");
    setMessage("");

    const response = await fetch(apiUrl(`/api/books/${id}`), {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Delete failed");
      return;
    }

    navigate("/books", { replace: true });
  }

  async function restoreBook() {
    setError("");
    setMessage("");

    const response = await fetch(apiUrl(`/api/books/${id}`), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Restore failed");
      return;
    }

    setMessage("Book restored");
    await loadBook();
  }

  if (loading) return <div>Loading book details...</div>;
  if (!book) return <div>{error || "Book not found"}</div>;

  return (
    <div>
      <Link to="/books">Back to books</Link>
      <h2>Book Detail</h2>
      {message && <div>{message}</div>}
      {error && <div>{error}</div>}

      <p>
        <strong>Title:</strong> {book.title}
      </p>
      <p>
        <strong>Author:</strong> {book.author}
      </p>
      <p>
        <strong>Location:</strong> {book.location}
      </p>
      <p>
        <strong>Quantity:</strong> {book.quantity}
      </p>
      <p>
        <strong>Status:</strong> {book.status}
      </p>

      {isAdmin && (
        <>
          <h3>Edit Book (ADMIN)</h3>
          <form onSubmit={updateBook}>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <input
              placeholder="Author"
              value={form.author}
              onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
              required
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              required
            />
            <input
              type="number"
              min={0}
              placeholder="Quantity"
              value={form.quantity}
              onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
              required
            />
            <button type="submit">Update</button>
          </form>

          {book.status !== "DELETED" && <button onClick={deleteBook}>Soft Delete</button>}
          {book.status === "DELETED" && <button onClick={restoreBook}>Restore</button>}
        </>
      )}
    </div>
  );
}
