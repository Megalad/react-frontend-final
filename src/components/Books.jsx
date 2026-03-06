import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function apiUrl(path) {
  return `${API_URL}${path}`;
}

export default function Books() {
  const { user } = useUser();
  const isAdmin = useMemo(() => user?.role === "ADMIN", [user?.role]);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    author: "",
    location: "",
    quantity: 1,
  });
  const [searchTitle, setSearchTitle] = useState("");
  const [searchAuthor, setSearchAuthor] = useState("");

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (searchTitle.trim()) params.set("title", searchTitle.trim());
      if (searchAuthor.trim()) params.set("author", searchAuthor.trim());

      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(apiUrl(`/api/books${query}`), {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to load books");
        return;
      }

      setBooks(data.books || []);
    } catch {
      setError("Failed to load books");
    } finally {
      setLoading(false);
    }
  }, [searchAuthor, searchTitle]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  async function createBook(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const response = await fetch(apiUrl("/api/books"), {
      method: "POST",
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
      setError(data.message || "Failed to create book");
      return;
    }

    setMessage("Book created");
    setForm({ title: "", author: "", location: "", quantity: 1 });
    await loadBooks();
  }

  if (loading && books.length === 0) {
    return <div>Loading books...</div>;
  }

  return (
    <div>
      <h2>Books</h2>
      {message && <div>{message}</div>}
      {error && <div>{error}</div>}

      <div>
        <input
          placeholder="Filter by title"
          value={searchTitle}
          onChange={(event) => setSearchTitle(event.target.value)}
        />
        <input
          placeholder="Filter by author"
          value={searchAuthor}
          onChange={(event) => setSearchAuthor(event.target.value)}
        />
      </div>

      {isAdmin && (
        <form onSubmit={createBook}>
          <h3>Add Book (ADMIN)</h3>
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
          <button type="submit">Create</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Location</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book._id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.location}</td>
              <td>{book.quantity}</td>
              <td>{book.status}</td>
              <td>
                <Link to={`/books/${book._id}`}>View</Link>
              </td>
            </tr>
          ))}
          {books.length === 0 && (
            <tr>
              <td colSpan="6">No books found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
