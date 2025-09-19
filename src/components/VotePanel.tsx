import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  ListItem,
  List,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

interface VotePanelProps {
  dates: any[];
  user: string;
  onVote: (dateId: string, type: "up" | "down") => void;
  totalUsers: number;
}

export default function VotePanel({
  dates,
  user,
  onVote,
  totalUsers,
}: VotePanelProps) {
  // Determine if any date is locked
  const anyDateLocked = dates.some(
    (date) => (date.votes?.up?.length || 0) === totalUsers
  );

  return (
    <Stack spacing={2} mt={3}>
      {dates.map((date) => {
        const upVotes = date.votes?.up?.length || 0;
        const downVotes = date.votes?.down?.length || 0;
        const hasVotedUp = date.votes?.up?.includes(user);
        const hasVotedDown = date.votes?.down?.includes(user);

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

              {/* Show locked message only on the date that triggered it */}
              {upVotes === totalUsers && (
                <Typography color="success.main" mt={1}>
                  ✅ This date is locked in!
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
