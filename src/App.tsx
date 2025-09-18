import { useState, useEffect } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import Login from "./components/LoginForm";
import AdminPanel from "./components/AdminPanel";
import VotePanel from "./components/VotePanel";

const usernames = ["alice", "bob", "charlie", "admin"];

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [dates, setDates] = useState<any[]>([]);

  // Live Firestore subscription
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "dates"), (snapshot) => {
      setDates(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleLogin = (username: string) => {
    if (usernames.includes(username)) {
      setUser(username);
    }
  };

  const handleLogout = () => setUser(null);

  // Admin adds date
  const addDate = async (dateStr: string) => {
    await addDoc(collection(db, "dates"), {
      date: dateStr,
      votes: { up: [], down: [] },
    });
  };

  // User votes
  const handleVote = async (dateId: string, type: "up" | "down") => {
    if (!user) return;
    const ref = doc(db, "dates", dateId);

    if (type === "up") {
      await updateDoc(ref, {
        "votes.up": arrayUnion(user),
        "votes.down": arrayRemove(user),
      });
    } else {
      await updateDoc(ref, {
        "votes.down": arrayUnion(user),
        "votes.up": arrayRemove(user),
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ position: "relative", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>
        🗓️ Fellas
      </Typography>

      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Box sx={{ position: "absolute", top: 16, right: 16 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#ff0f0fff",
                color: "#fff",
                borderRadius: "12px",
                textTransform: "none",
                "&:hover": { bgcolor: "#cc0c0c" },
              }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>

          <Typography variant="h6">Welcome, {user}!</Typography>

          {user === "admin" ? (
            <AdminPanel onAddDate={addDate} dates={dates} />
          ) : (
            <VotePanel
              dates={dates}
              user={user}
              onVote={handleVote}
              totalUsers={usernames.length - 1}
            />
          )}
        </>
      )}
    </Container>
  );
}
