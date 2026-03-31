import PropTypes from "prop-types";
import * as Yup from "yup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { ListItemText } from "@mui/material";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFAutocomplete,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import axiosInstance from "@/lib/admin-axios";

// ----------------------------------------------------------------------

export default function AssignCompanyForm({
  driver,
  open,
  onClose,
  refetch,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const schema = Yup.object().shape({
    company: Yup.object().required("Select Company"),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      company: driver?.companyInfo,
    },
  });

  const {
    handleSubmit,
    setValue,
  } = methods;

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/company/find-all?count=1000&page=1');
      setCompanies(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.log("Error fetching companies:", err);
      enqueueSnackbar("Failed to load companies. Please try again.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCompanies();
      setValue("company", null);
    }
  }, [open]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      const result = await axiosInstance.patch(
        `/drivers/${driver.id}`,
        { companyId: data.company.id }
      );
      
      if (result.data.success || result.status === 200) {
        enqueueSnackbar("Company assigned successfully", { variant: "success" });
        setLoading(false);
        onClose();
        refetch();
      }
    } catch (error) {
      console.error("Error assigning company:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to assign company. Please try again later.", {
        variant: "error",
      });
      setLoading(false);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Select Company for the Driver:</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: `repeat(1, 1fr)`,
            }}
          >
            <RHFAutocomplete
              name="company"
              label="Companies"
              options={companies}
              getOptionLabel={(option) => option?.companyName || ""}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <ListItemText
                      primary={option?.companyName}
                      secondary={option?.companyEmail}
                      primaryTypographyProps={{ typography: "body2" }}
                      secondaryTypographyProps={{
                        component: "span",
                        color: "text.disabled",
                      }}
                    />
                  </Box>
                </li>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            disabled={loading}
          >
            Assign Company
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

AssignCompanyForm.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  driver: PropTypes.object,
  refetch: PropTypes.func,
};
