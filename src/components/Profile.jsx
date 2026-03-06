import { useUser } from "../contexts/UserProvider";

export default function Profile() {
  const { user } = useUser();

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-card">
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>
    </div>
  );
}
