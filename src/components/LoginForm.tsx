import { useState } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

interface LoginFormProps {
  onLogin: (username: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onLogin(username.trim());
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      mt={6}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 360,
          p: 4,
          borderRadius: "20px",
          bgcolor: "#252525",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "rgba(108,99,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <PersonIcon sx={{ color: "#6c63ff", fontSize: 28 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontFamily: '"Baloo 2", cursive', mb: 0.5 }}
          >
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Enter your username to vote on dates
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            size="small"
            autoComplete="off"
            autoFocus
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!username.trim()}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              py: 1,
              bgcolor: "#6c63ff",
              "&:hover": { bgcolor: "#574fd6" },
              "&:disabled": { bgcolor: "rgba(108,99,255,0.3)", color: "rgba(255,255,255,0.3)" },
            }}
          >
            Sign in
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
