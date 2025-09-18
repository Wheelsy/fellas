import { useState } from "react";
import {
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// @ts-ignore
import dayjs, { Dayjs } from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";

interface AdminPanelProps {
  onAddDate: (dateStr: string) => void;
  dates: { id: string; date: string }[];
}

export default function AdminPanel({ onAddDate, dates }: AdminPanelProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const handleAdd = () => {
    if (selectedDate) {
      onAddDate(selectedDate.format("YYYY-MM-DD"));
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
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <DatePicker
          label="Pick a date"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          sx={{ minWidth: 150 }}
        />
        <Button
          variant="contained"
          sx={{
            bgcolor: "#99fd27ff",
            color: "#000",
            borderRadius: "12px",
            textTransform: "none",
            "&:hover": { bgcolor: "#7bc91f" },
          }}
          onClick={handleAdd}
        >
          Add Date
        </Button>
      </Box>

      <List sx={{ mt: 3 }}>
        {dates.length === 0 && <Box>No dates added yet.</Box>}
        {dates.map((d) => (
          <ListItem
            key={d.id}
            secondaryAction={
              <IconButton
                edge="end"
                color="error"
                onClick={() => handleRemove(d.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={d.date} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
