import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  ListItem,
  List,
  Button,
  Grid,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

interface VotePanelProps {
  dates: any[];
  user: string;
  onVote: (dateId: string, type: "up" | "down") => void;
  totalUsers: number;
}

// Helper to generate ICS content
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
  const formatDate = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
      d.getUTCDate()
    )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  return `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
};

export default function VotePanel({
  dates,
  user,
  onVote,
  totalUsers,
}: VotePanelProps) {
  const anyDateLocked = dates.some(
    (date) => (date.votes?.up?.length || 0) === totalUsers
  );

  const handleDownloadICS = (dateStr: string) => {
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // default 30 min
    const icsContent = generateICS({
      title: "Jackbox with the fellas",
      start,
      end,
      description: "Let's jack it!",
      location: "Discord",
    });

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Jackbox-invite.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={2} mt={3}>
      {dates.map((date) => {
        const upVotes = date.votes?.up?.length || 0;
        const downVotes = date.votes?.down?.length || 0;
        const hasVotedUp = date.votes?.up?.includes(user);
        const hasVotedDown = date.votes?.down?.includes(user);

        const isLocked = upVotes === totalUsers;

        return (
          <Card
            key={date.id}
            sx={{ bgcolor: "#292929", borderRadius: "16px", boxShadow: 4 }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontFamily: '"Baloo 2", cursive', color: "#ff80ab" }}
              >
                {date.date}
              </Typography>

              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <IconButton
                  color={hasVotedUp ? "primary" : "default"}
                  onClick={() => !anyDateLocked && onVote(date.id, "up")}
                  disabled={anyDateLocked}
                >
                  <ThumbUpIcon />
                </IconButton>
                <Typography>{upVotes}</Typography>

                <IconButton
                  color={hasVotedDown ? "error" : "default"}
                  onClick={() => !anyDateLocked && onVote(date.id, "down")}
                  disabled={anyDateLocked}
                >
                  <ThumbDownIcon />
                </IconButton>
                <Typography>{downVotes}</Typography>
                <List>
                  <ListItem>
                    <Box
                      display="flex"
                      width="100%"
                      justifyContent="space-between"
                      paddingLeft={4}
                    >
                      <Box flex={1} mr={2}>
                        <Typography fontWeight="bold">Upvoted</Typography>
                        {date.votes.up.map((user: string) => (
                          <Typography key={`up-${user}`}>{user}</Typography>
                        ))}
                      </Box>
                      <Box flex={1} ml={2}>
                        <Typography fontWeight="bold">Downvoted</Typography>
                        {date.votes.down.map((user: string) => (
                          <Typography key={`down-${user}`}>{user}</Typography>
                        ))}
                      </Box>
                    </Box>
                  </ListItem>
                </List>
              </Box>

              {isLocked && (
                <Grid container spacing={2}>
                  <Grid>
                    <Typography color="success.main" mt={1}>
                      ✅ This date is locked in!
                    </Typography>
                  </Grid>
                  <Grid>
                    <Button
                      variant="contained"
                      sx={{ mt: 1 }}
                      onClick={() => handleDownloadICS(date.date)}
                    >
                      Download Calendar Invite
                    </Button>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
