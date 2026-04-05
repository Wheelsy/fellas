import { useState } from "react";
import {
  Button,
  Box,
  IconButton,
  Typography,
  Paper,
} from "@mui/material";
// @ts-ignore
import dayjs, { Dayjs } from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { DateTimePicker } from "@mui/x-date-pickers";

interface AdminPanelProps {
  onAddDate: (dateStr: string) => void;
  dates: { id: string; date: string }[];
}

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

export default function AdminPanel({ onAddDate, dates }: AdminPanelProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const handleAdd = () => {
    if (selectedDate) {
      onAddDate(selectedDate.format("YYYY-MM-DD hh:mma"));
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
