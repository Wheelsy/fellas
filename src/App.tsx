import { useState, useEffect } from "react";
import { Container, Typography, Button, Box, Divider } from "@mui/material";
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

const usernames = ["wheels", "gibbo", "heckles", "mo", "jag", "b", "lachy", "admin"];

// Parse "YYYY-MM-DD hh:mma" to a sortable timestamp
const parseDateStrToMs = (dateStr: string): number => {
  const [datePart, timePart] = (dateStr || "").split(" ");
  if (!datePart || !timePart) return 0;
  const isPM = timePart.toLowerCase().includes("pm");
  const timeNumbers = timePart.replace(/[apm]/gi, "").split(":");
  let hours = parseInt(timeNumbers[0] || "0", 10);
  const minutes = parseInt(timeNumbers[1] || "0", 10);
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  return new Date(
    `${datePart}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
  ).getTime();
};

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [dates, setDates] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "dates"), (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Sort chronologically
      docs.sort((a: any, b: any) => parseDateStrToMs(a.date) - parseDateStrToMs(b.date));
      setDates(docs);
    });
    return () => unsub();
  }, []);

  const handleLogin = (username: string) => {
    username = username.toLowerCase();
    if (usernames.includes(username)) {
      setUser(username);
    }
  };

  const handleLogout = () => setUser(null);

  const addDate = async (dateStr: string) => {
    await addDoc(collection(db, "dates"), {
      date: dateStr,
      votes: { up: [], down: [] },
    });
  };

  const addDates = async (dateStrs: string[]) => {
    await Promise.all(
      dateStrs.map((dateStr) =>
        addDoc(collection(db, "dates"), {
          date: dateStr,
          votes: { up: [], down: [] },
        })
      )
    );
  };

  const handleVote = async (dateId: string, type: "up" | "down") => {
    if (!user) return;
    const ref = doc(db, "dates", dateId);
    const dateData = dates.find((d) => d.id === dateId);
    const alreadyVotedUp = dateData?.votes?.up?.includes(user);
    const alreadyVotedDown = dateData?.votes?.down?.includes(user);

    if (type === "up") {
      if (alreadyVotedUp) {
        // Toggle off — removes vote, unlocks if it was locked
        await updateDoc(ref, { "votes.up": arrayRemove(user) });
      } else {
        await updateDoc(ref, {
          "votes.up": arrayUnion(user),
          "votes.down": arrayRemove(user),
        });
      }
    } else {
      if (alreadyVotedDown) {
        // Toggle off
        await updateDoc(ref, { "votes.down": arrayRemove(user) });
      } else {
        await updateDoc(ref, {
          "votes.down": arrayUnion(user),
          "votes.up": arrayRemove(user),
        });
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", py: 3 }}>
      {/* App header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Baloo 2", cursive', lineHeight: 1.1 }}
          >
            🎮 SpReAdY wHeN
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Jackbox night scheduler
          </Typography>
        </Box>

        {user && (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="body2" color="text.secondary">
              {user}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.6)",
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "0.75rem",
                "&:hover": {
                  borderColor: "#f44336",
                  color: "#f44336",
                  bgcolor: "rgba(244,67,54,0.08)",
                },
              }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ opacity: 0.15, mb: 2 }} />

      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {user === "admin" ? (
            <AdminPanel onAddDate={addDate} onAddDates={addDates} dates={dates} />
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
