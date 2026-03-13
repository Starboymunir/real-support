"use client";

import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useContactUsQuery } from "@/hooks/ContactUs";
import Container from "@mui/material/Container";
import { Box, Card, Grid, MenuItem, Stack, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useParams, useRouter } from "next/navigation";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/ApiClient";
import { useSnackbar } from "notistack";
import { IContactUs } from "@/types/type";
import { useSocket } from "@/providers/SocketProvider";
import { SOCKET_EVENT_ENUM } from "@/helpers/constants";

const statusOptions = [
  { value: "PENDING", label: "PENDING" },
  { value: "PROCESSING", label: "PROCESSING" },
  { value: "COMPLETED", label: "COMPLETED" },
];

const FeedbackSchema = Yup.object().shape({
  messageContent: Yup.string().trim().required("Message is required"),
  status: Yup.string().oneOf(["PENDING", "PROCESSING", "COMPLETED"]),
});

const EditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: feedback, isPending, refetch } = useContactUsQuery(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { socket } = useSocket();

  const methods = useForm({
    resolver: yupResolver(FeedbackSchema),
    defaultValues: {
      status: feedback?.status || "",
      messageContent: "",
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (values) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...values,
        sender: "ADMIN",
      };
      const response = await apiClient.patch<IContactUs>(
        `/contact-us/${id}`,
        payload
      );
      if (!response.success) {
        enqueueSnackbar(response.message || "Failed to update feedback", {
          variant: "error",
        });
        return;
      }
      enqueueSnackbar(response.message || "Feedback updated successfully");
      // Refresh conversation without leaving page
      await refetch();

      // Clear only the message box
      reset((prev) => ({
        ...prev,
        messageContent: "",
      }));
    } catch (error) {
      console.error("Error updating feedback:", error);
      enqueueSnackbar("Something went wrong", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  });

  const getGreeting = (feedback: IContactUs) => {
    const hasAdminResponse = feedback?.messages?.some(
      (msg) => msg.sender === "ADMIN"
    );

    if (!hasAdminResponse) {
      // First admin reply
      return `Dear ${feedback.name},\nThank you for contacting us. We’ve received your message and will get back to you shortly.\n\n\nKind regards,\nSupport Team`;
    }

    // Follow-up replies
    if (feedback.status === "COMPLETED") {
      return `**`;
    } else {
      return `Dear ${feedback.name},\nThank you for your reply. We appreciate your patience as we continue assisting you.\n\n\nKind regards,\nSupport Team`;
    }
  };

  useEffect(() => {
    if (feedback) {
      reset({
        status: feedback.status || "",
        messageContent: getGreeting(feedback),
      });
    }
  }, [feedback, reset]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (contact: { id: string }) => {
      if (contact.id === id) {
        refetch();
      }
    };

    socket.on(
      SOCKET_EVENT_ENUM.CONTACT_US.CONTACT_US_UPDATED,
      handleNewMessage
    );

    return () => {
      socket.off(
        SOCKET_EVENT_ENUM.CONTACT_US.CONTACT_US_UPDATED,
        handleNewMessage
      );
    };
  }, [socket, id, refetch]);

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
            name: "Edit",
            href: paths.dashboard.userFeedbacks.edit("id"),
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card>
        <Box p={3}>
          <Typography variant="h6" textAlign="center">
            Edit Feedback
          </Typography>
        </Box>
        <Grid container spacing={2} padding={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              Subject:
            </Typography>
            <Typography variant="body1">{feedback?.reason}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              Status:
            </Typography>
            <Typography variant="body1">{feedback?.status}</Typography>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant="subtitle1" fontWeight="bold">
              Messages:
            </Typography>
            <Box
              mt={1}
              // maxHeight={400}
              overflow="auto"
              pr={1}
              sx={{ "&::-webkit-scrollbar": { display: "none" } }}
            >
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
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    textAlign="right"
                  >
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
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Box padding={3}>
            <Card sx={{ p: 3, mb: 3 }}>
              {/* Message input */}
              <RHFTextField
                multiline
                name="messageContent"
                label="Message"
                disabled={feedback?.status === "COMPLETED"}
              />

              {/* Ticket status (optional, probably admin only) */}
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(3, 1fr)",
                }}
                mt={3}
              >
                <RHFSelect name="status" label="Status">
                  {statusOptions?.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Box>

              {/* Submit button */}
              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Send Message
                </LoadingButton>
              </Stack>
            </Card>
          </Box>
        </FormProvider>
      </Card>
    </Container>
  );
};

export default EditPage;
