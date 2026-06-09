import { useState } from "react";
import {
  Button,
  Box,
  IconButton,
  Typography,
  Paper,
  Chip,
  TextField,
} from "@mui/material";
// @ts-ignore
import dayjs, { Dayjs } from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { DateTimePicker } from "@mui/x-date-pickers";

interface AdminPanelProps {
  onAddDate: (dateStr: string) => void;
  onAddDates: (dateStrs: string[]) => void;
  dates: { id: string; date: string }[];
}

const FMT = "YYYY-MM-DD hh:mma";

const parseDateDisplay = (dateStr: string) => {
  const [datePart, timePart] = (dateStr || "").split(" ");
  if (!datePart) return { dayName: "Unknown", shortDate: "", time: "" };
  const dateObj = new Date(`${datePart}T12:00:00`);
  const dayName = dateObj.toLocaleDateString("en-AU", { weekday: "long" });
  const shortDate = dateObj.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const cleanTime = (timePart || "").replace(/^0(\d)/, "$1").toUpperCase();
  return { dayName, shortDate, time: cleanTime };
};

export default function AdminPanel({ onAddDate, onAddDates, dates }: AdminPanelProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [pending, setPending] = useState<string[]>([]);

  // Add current pick (x repeatWeeks consecutive weeks) to the staging list
  const handleStage = () => {
    if (!selectedDate) return;
    const weeks = Math.max(1, Math.min(52, repeatWeeks || 1));
    const additions: string[] = [];
    for (let i = 0; i < weeks; i++) {
      additions.push(selectedDate.add(i, "week").format(FMT));
    }
    setPending((prev) => {
      const merged = [...prev];
      for (const d of additions) if (!merged.includes(d)) merged.push(d);
      return merged;
    });
    setSelectedDate(null);
    setRepeatWeeks(1);
  };

  const handleUnstage = (dateStr: string) => {
    setPending((prev) => prev.filter((d) => d !== dateStr));
  };

  const handleCommit = () => {
    if (pending.length === 0) return;
    onAddDates(pending);
    setPending([]);
  };

  const handleAdd = () => {
    if (selectedDate) {
      onAddDate(selectedDate.format(FMT));
      setSelectedDate(null);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await deleteDoc(doc(db, "dates", id));
    } catch (err) {
      console.error("Failed to remove date:", err);
    }
  };

  return (
    <Box mt={3}>
      {/* Add date section */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: "16px",
          bgcolor: "#252525",
          border: "1px solid rgba(255,255,255,0.07)",
          mb: 3,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.secondary"
          mb={2}
          sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.7rem" }}
        >
          Propose a date
        </Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <DateTimePicker
            label="Pick a date & time"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            sx={{
              minWidth: 200,
              flex: 1,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!selectedDate}
            sx={{
              bgcolor: "#99fd27",
              color: "#000",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#7bc91f" },
              "&:disabled": { bgcolor: "rgba(153,253,39,0.2)", color: "rgba(0,0,0,0.3)" },
            }}
            onClick={handleAdd}
          >
            Add Date
          </Button>
        </Box>

        {/* Batch: stage many at once */}
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap" mt={2}>
          <TextField
            label="Repeat weekly ×"
            type="number"
            size="small"
            value={repeatWeeks}
            onChange={(e) => setRepeatWeeks(parseInt(e.target.value, 10) || 1)}
            inputProps={{ min: 1, max: 52 }}
            sx={{ width: 130, "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
          <Button
            variant="outlined"
            startIcon={<PlaylistAddIcon />}
            disabled={!selectedDate}
            onClick={handleStage}
            sx={{
              borderColor: "rgba(153,253,39,0.5)",
              color: "#99fd27",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              whiteSpace: "nowrap",
              "&:hover": { borderColor: "#99fd27", bgcolor: "rgba(153,253,39,0.08)" },
            }}
          >
            Add to batch
          </Button>
        </Box>

        {pending.length > 0 && (
          <Box mt={2}>
            <Box display="flex" flexWrap="wrap" gap={1} mb={1.5}>
              {pending.map((d) => {
                const { dayName, shortDate, time } = parseDateDisplay(d);
                return (
                  <Chip
                    key={d}
                    label={`${dayName} ${shortDate} · ${time}`}
                    onDelete={() => handleUnstage(d)}
                    sx={{
                      bgcolor: "#1e1e1e",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                );
              })}
            </Box>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleCommit}
              sx={{
                bgcolor: "#99fd27",
                color: "#000",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#7bc91f" },
              }}
            >
              Add all {pending.length} date{pending.length > 1 ? "s" : ""}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Dates list */}
      <Typography
        variant="body2"
        fontWeight={600}
        color="text.secondary"
        mb={1.5}
        sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.7rem" }}
      >
        Proposed dates ({dates.length})
      </Typography>

      {dates.length === 0 ? (
        <Typography color="text.secondary" variant="body2" sx={{ opacity: 0.5, mt: 1 }}>
          No dates added yet.
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          {dates.map((d) => {
            const { dayName, shortDate, time } = parseDateDisplay(d.date);
            return (
              <Paper
                key={d.id}
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.25,
                  borderRadius: "12px",
                  bgcolor: "#1e1e1e",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ fontFamily: '"Baloo 2", cursive', color: "#ff80ab" }}
                  >
                    {dayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {shortDate} · {time}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemove(d.id)}
                  sx={{
                    opacity: 0.6,
                    "&:hover": { opacity: 1, bgcolor: "rgba(244,67,54,0.1)" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
