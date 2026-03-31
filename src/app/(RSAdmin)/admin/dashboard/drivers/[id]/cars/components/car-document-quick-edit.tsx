import PropTypes from "prop-types";
import * as Yup from "yup";
import { useCallback, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFUpload,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { resolveS3Url } from '@/lib/api';
import { uploadImageFile } from '@/helpers/imageUpload';
import axiosInstance from '@/lib/admin-axios';

// ----------------------------------------------------------------------

type DocumentsMap = Record<string, string>;

interface CurrentData {
  documentsList: DocumentsMap;
  documentTitle: string;
}

interface CarDocQuickEditFormProps {
  title: string;
  currentData: CurrentData;
  open: boolean;
  onClose: () => void;
  documentId: string | number;
  carId?: string;
  setChangeFlag: Dispatch<SetStateAction<boolean>>;
}

export default function CarDocQuickEditForm({
  title,
  currentData,
  open,
  onClose,
  documentId,
  carId,
  setChangeFlag,
}: CarDocQuickEditFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const documentsList: DocumentsMap = currentData?.documentsList || {};
  const docShape: Record<string, Yup.AnySchema> = {};
  Object.keys(documentsList).forEach((key) => {
    docShape[key] = Yup.mixed();
  });
  const DocSchema = Yup.object().shape(docShape);

  const defaultValues = useMemo(() => {
    const vals: Record<string, any> = {};
    Object.keys(documentsList).forEach((key) => {
      vals[key] = documentsList[key] || "";
      vals[`${key}-preview`] = "";
    });
    return vals;
  }, [documentsList]);

  const methods = useForm<Record<string, any>>({
    resolver: yupResolver(DocSchema as any),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const handleDrop = useCallback(
    (key: string, acceptedFile: File) => {
      const file = acceptedFile as File;

      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setValue(key, file as any, { shouldValidate: true });
        setValue(`${key}-preview`, newFile as any, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(
    (key: string) => {
      // For single-file inputs, just clear the file and its preview
      setValue(key, null as any, { shouldValidate: true });
      setValue(`${key}-preview`, "", { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (data: Record<string, any>) => {
    try {
      // Upload any new File objects to S3 first
      const uploadedFields: Record<string, string> = {};
      for (const key in data) {
        if (key.endsWith('-preview') || key.endsWith('preview')) continue;
        const val = data[key];
        if (val instanceof File) {
          const url = await uploadImageFile(val);
          if (!url) throw new Error(`Failed to upload ${key}`);
          uploadedFields[key] = url;
        } else if (typeof val === 'string' && val) {
          uploadedFields[key] = val;
        }
      }

      const docType = currentData.documentTitle;
      if (!carId) {
        enqueueSnackbar('Missing car ID', { variant: 'error' });
        return;
      }

      // Map car document types to backend POST endpoints
      const endpointMap: Record<string, string> = {
        insuranceDocument: '/documents/driver/car/insurance',
        motDocument: '/documents/driver/car/mot',
        pcoDocument: '/documents/driver/car/car_pco_document',
        vehicleLogBook: '/documents/driver/car/vehicleLogBook',
      };

      const endpoint = endpointMap[docType];
      if (!endpoint) {
        enqueueSnackbar(`Unknown document type: ${docType}`, { variant: 'error' });
        return;
      }

      const payload: Record<string, any> = { carId, ...uploadedFields };
      await axiosInstance.post(endpoint, payload);
      setChangeFlag((prev) => !prev);
      enqueueSnackbar('Update success!');
      onClose();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        enqueueSnackbar(error?.response?.data?.message, { variant: 'error' });
      } else {
        enqueueSnackbar(error?.message || 'Something went wrong', { variant: 'error' });
      }
    }
  });

  useEffect(() => {
    for (const file of Object.keys(documentsList)) {
      if (documentsList[file]) {
        const url = resolveS3Url(documentsList[file]);
        setValue(`${file}-preview`, url ?? "");
      }
    }
  }, [documentsList, setValue]);

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
        <DialogTitle>{`Update ${title}`}</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: `repeat(${Object.keys(documentsList)?.length}, 1fr)`,
            }}
          >
            {Object.keys(documentsList).map((key, index) => (
              <RHFUpload
                key={key}
                thumbnail
                name={`${key}-preview`}
                maxSize={3145728}
                onDrop={(acceptedFiles: File[]) => handleDrop(key, acceptedFiles[0])}
                onRemove={() => handleRemoveFile(key)}
                onUpload={() => console.info("ON UPLOAD")}
              />
            ))}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

CarDocQuickEditForm.propTypes = {
  title: PropTypes.string,
  currentData: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  carId: PropTypes.string,
  setChangeFlag: PropTypes.func,
};
