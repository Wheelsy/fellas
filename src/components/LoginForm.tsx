import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

interface LoginFormProps {
  onLogin: (username: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");

  return (
    <Box display="flex" gap={2} mt={3}>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        size="small"
      />
      <Button
        variant="contained"
        onClick={() => onLogin(username.trim())}
        disabled={!username.trim()}
      >
        Login
      </Button>
    </Box>
  );
}
