import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, {
        newPassword: password,
      });

      setMessage(res.data.message);

      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Reset Password
        </button>
      </form>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "100px auto",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
  },
  button: {
    padding: 10,
    width: "100%",
  },
};

export default ResetPassword;