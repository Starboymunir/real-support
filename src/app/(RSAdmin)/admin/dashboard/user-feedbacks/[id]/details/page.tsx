"use client";

import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useContactUsQuery } from "@/hooks/ContactUs";
import Container from "@mui/material/Container";
import { Box, Card, Grid, Typography } from "@mui/material";
import { useParams } from "next/navigation";

const DetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: feedback, isPending } = useContactUsQuery(id);

  if (isPending) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Feedbacks List"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Feedbacks", href: paths.dashboard.userFeedbacks.root },
          {
            name: "Details",
            href: paths.dashboard.userFeedbacks.details(id),
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card>
        <Box p={3}>
          <Typography variant="h6" textAlign="center">
            User Details
          </Typography>
        </Box>
        <Grid container spacing={2} padding={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              Name:
            </Typography>
            <Typography variant="body1">{feedback?.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              Email:
            </Typography>
            <Typography variant="body1">{feedback?.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              Phone:
            </Typography>
            <Typography variant="body1">{feedback?.phone_number}</Typography>
          </Grid>
        </Grid>
        <Box p={3}>
          <Typography variant="h6" textAlign="center">
            Contact Details
          </Typography>
        </Box>
        <Grid container spacing={2} padding={3}>
          <Grid item xs={12} sm={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              Status:
            </Typography>
            <Typography variant="body1">{feedback?.status}</Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              Subject:
            </Typography>
            <Typography variant="body1">{feedback?.reason}</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle1" fontWeight="bold">
              Messages:
            </Typography>
            <Box mt={1}>
              {feedback?.messages?.map((msg) => (
                <Box
                  key={msg.id}
                  mb={1}
                  p={1.5}
                  borderRadius={2}
                  bgcolor={
                    msg.sender === "CLIENT" ? "grey.200" : "primary.light"
                  }
                  // textAlign={msg.sender === "CLIENT" ? "left" : "right"}
                >
                  <Typography variant="body2" fontWeight="medium">
                    {msg.sender}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                    {msg.content}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {new Date(msg.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default DetailsPage;
