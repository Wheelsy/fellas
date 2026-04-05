import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import DownloadIcon from "@mui/icons-material/Download";
import LockIcon from "@mui/icons-material/Lock";

interface VotePanelProps {
  dates: any[];
  user: string;
  onVote: (dateId: string, type: "up" | "down") => void;
  totalUsers: number;
}

// Parse "YYYY-MM-DD hh:mma" into display parts
const parseDateStr = (dateStr: string) => {
  const [datePart, timePart] = (dateStr || "").split(" ");
  if (!datePart) return { dayName: "Unknown", shortDate: "", time: "" };
  // Use noon local to avoid timezone-boundary issues with date-only parsing
  const dateObj = new Date(`${datePart}T12:00:00`);
  const dayName = dateObj.toLocaleDateString("en-AU", { weekday: "long" });
  const shortDate = dateObj.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  // "02:30pm" → "2:30PM"
  const cleanTime = (timePart || "").replace(/^0(\d)/, "$1").toUpperCase();
  return { dayName, shortDate, time: cleanTime };
};

// Parse "YYYY-MM-DD hh:mma" into a real Date object for ICS
const parseToDate = (dateStr: string): Date => {
  const [datePart, timePart] = (dateStr || "").split(" ");
  if (!datePart || !timePart) return new Date();
  const isPM = timePart.toLowerCase().includes("pm");
  const timeNumbers = timePart.replace(/[apm]/gi, "").split(":");
  let hours = parseInt(timeNumbers[0] || "0", 10);
  const minutes = parseInt(timeNumbers[1] || "0", 10);
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  return new Date(
    `${datePart}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
  );
};

const generateICS = ({
  title,
  start,
  end,
  description = "",
  location = "",
}: {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
};

export default function VotePanel({ dates, user, onVote, totalUsers }: VotePanelProps) {
  const anyDateLocked = dates.some((d) => (d.votes?.up?.length || 0) === totalUsers);

  const handleDownloadICS = (dateStr: string) => {
    const start = parseToDate(dateStr);
    const end = new Date(start.getTime() + 120 * 60 * 1000);
    const icsContent = generateICS({
      title: "Jackbox with the fellas",
      start,
      end,
      description: "Let's jack it!",
      location: "Discord",
    });
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Jackbox-invite.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={2} mt={3}>
      {dates.length === 0 && (
        <Typography color="text.secondary" textAlign="center" mt={6} sx={{ opacity: 0.6 }}>
          No dates proposed yet — check back soon!
        </Typography>
      )}

      {dates.map((date) => {
        const upVotes = date.votes?.up?.length || 0;
        const downVotes = date.votes?.down?.length || 0;
        const hasVotedUp = date.votes?.up?.includes(user);
        const hasVotedDown = date.votes?.down?.includes(user);
        const isLocked = upVotes === totalUsers;
        const { dayName, shortDate, time } = parseDateStr(date.date);

        // When a date is locked:
        //   - thumbs up is still clickable (lets users remove their vote to unlock)
        //   - thumbs down is disabled
        // When another date is locked:
        //   - everything on non-locked cards is disabled
        const thumbUpDisabled = anyDateLocked && !isLocked;
        const thumbDownDisabled = anyDateLocked;

        return (
          <Card
            key={date.id}
            sx={{
              bgcolor: isLocked ? "#162016" : "#252525",
              borderRadius: "16px",
              boxShadow: isLocked
                ? "0 0 0 2px #4caf50, 0 4px 20px rgba(76,175,80,0.15)"
                : "0 2px 12px rgba(0,0,0,0.4)",
              transition: "box-shadow 0.2s",
            }}
          >
            <CardContent sx={{ pb: "16px !important" }}>
              {/* Date header */}
              <Box mb={1.5}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Baloo 2", cursive',
                    color: isLocked ? "#66bb6a" : "#ff80ab",
                    lineHeight: 1.2,
                    letterSpacing: "0.01em",
                  }}
                >
                  {dayName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {shortDate} · {time}
                </Typography>
              </Box>

              {isLocked && (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1.5}
                  sx={{
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    borderRadius: "8px",
                    px: 1.5,
                    py: 0.75,
                    border: "1px solid rgba(76,175,80,0.2)",
                  }}
                >
                  <LockIcon sx={{ color: "#66bb6a", fontSize: 16 }} />
                  <Typography color="success.main" variant="body2" fontWeight={600}>
                    Locked in! Tap your thumbs up to unlock.
                  </Typography>
                </Box>
              )}

              <Divider sx={{ mb: 1.5, opacity: 0.15 }} />

              {/* Votes row */}
              <Box display="flex" gap={3}>
                {/* Upvotes */}
                <Box flex={1} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={0.5} mb={0.75}>
                    <IconButton
                      size="small"
                      onClick={() => !thumbUpDisabled && onVote(date.id, "up")}
                      disabled={thumbUpDisabled}
                      sx={{
                        color: hasVotedUp ? "#6c63ff" : "rgba(255,255,255,0.3)",
                        "&:hover:not(:disabled)": { color: "#6c63ff", bgcolor: "rgba(108,99,255,0.1)" },
                        transition: "color 0.15s",
                        p: "4px",
                      }}
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" fontWeight={700} sx={{ color: hasVotedUp ? "#6c63ff" : "text.primary" }}>
                      {upVotes}
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {date.votes?.up?.map((name: string) => (
                      <Chip
                        key={name}
                        label={name}
                        size="small"
                        sx={{
                          bgcolor: name === user ? "rgba(108,99,255,0.35)" : "rgba(108,99,255,0.15)",
                          color: name === user ? "#c4beff" : "#9d96e8",
                          fontSize: "0.68rem",
                          height: "20px",
                          fontWeight: name === user ? 700 : 400,
                          border: name === user ? "1px solid rgba(108,99,255,0.4)" : "none",
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Downvotes */}
                <Box flex={1} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={0.5} mb={0.75}>
                    <IconButton
                      size="small"
                      onClick={() => !thumbDownDisabled && onVote(date.id, "down")}
                      disabled={thumbDownDisabled}
                      sx={{
                        color: hasVotedDown ? "#f44336" : "rgba(255,255,255,0.3)",
                        "&:hover:not(:disabled)": { color: "#f44336", bgcolor: "rgba(244,67,54,0.1)" },
                        transition: "color 0.15s",
                        p: "4px",
                      }}
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" fontWeight={700} sx={{ color: hasVotedDown ? "#f44336" : "text.primary" }}>
                      {downVotes}
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {date.votes?.down?.map((name: string) => (
                      <Chip
                        key={name}
                        label={name}
                        size="small"
                        sx={{
                          bgcolor: name === user ? "rgba(244,67,54,0.3)" : "rgba(244,67,54,0.12)",
                          color: name === user ? "#ffb3ae" : "#ef9a9a",
                          fontSize: "0.68rem",
                          height: "20px",
                          fontWeight: name === user ? 700 : 400,
                          border: name === user ? "1px solid rgba(244,67,54,0.35)" : "none",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              {isLocked && (
                <Box mt={2}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    size="small"
                    sx={{
                      bgcolor: "#388e3c",
                      color: "#fff",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#2e7d32" },
                    }}
                    onClick={() => handleDownloadICS(date.date)}
                  >
                    Download Calendar Invite
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
