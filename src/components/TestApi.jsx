import { useEffect, useState } from "react";

function TestApi() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:3000/api/user/login")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage("Error connecting API"));
  }, []);

  return (
    <div>
      <h2>Test API Result</h2>
      <p>{message}</p>
    </div>
  );
}

export default TestApi;
