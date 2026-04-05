import * as Yup from "yup";
import { useCallback, useEffect, useMemo } from "react";
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
import axiosInstance from "@/lib/admin-axios";

interface DocQuickEditFormProps {
  title: string;
  currentData: { documentsList?: Record<string, any>; documentTitle?: string } | null;
  open: boolean;
  onClose: () => void;
  documentId: string;
  driverId?: string;
  refetch: () => void;
}

export default function DocQuickEditForm({
  title,
  currentData,
  open,
  onClose,
  documentId,
  driverId,
  refetch,
}: DocQuickEditFormProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const documentsList: Record<string, any> = (currentData?.documentsList ?? {}) as Record<string, any>;
  const DocSchema = Yup.object().shape(
    Object.keys(documentsList).reduce((schema: Record<string, Yup.AnySchema>, key: string) => {
      schema[key] = Yup.mixed();
      return schema;
    }, {} as Record<string, Yup.AnySchema>)
  ) as Yup.ObjectSchema<Record<string, any>>;

  const defaultValues = useMemo(() => {
    const generateDefaultValues = (data: Record<string, any>): Record<string, any> => {
      const result: Record<string, any> = {};

      for (const key in data) {
        if (typeof data[key] === "object" && data[key] !== null) {
          result[key] = generateDefaultValues(data[key]);
        } else {
          result[key] = data[key] || "";
        }
      }

      return result;
    };

    return generateDefaultValues(documentsList as Record<string, any>);
  }, [documentsList]);

  const methods = useForm<Record<string, any>>({
    resolver: yupResolver(DocSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch() as Record<string, any>;

  const handleDrop = useCallback(
    (key: string, acceptedFile: File) => {
      const file = acceptedFile;

      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setValue(key, file, { shouldValidate: true });
        setValue(`${key}-preview`, newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(
    (key: string) => {
      // Reset both the file and its preview value
      setValue(key, null as any, { shouldValidate: true });
      setValue(`${key}-preview`, undefined as any, { shouldValidate: true });
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

      const docType = currentData?.documentTitle;
      if (!docType || !driverId) {
        enqueueSnackbar('Missing document type or driver ID', { variant: 'error' });
        return;
      }

      // Map document types to their backend POST endpoints
      const endpointMap: Record<string, string> = {
        drivingLicense: '/documents/driving-license',
        bankDocuments: '/documents/bank-account',
        pcoDocuments: '/documents/pco',
        passport: '/documents/passport',
        addressProfDocs: '/documents/address',
        // Car document types
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

      // Build payload with driverId + uploaded file URLs
      const payload: Record<string, any> = { driverId, ...uploadedFields };

      await axiosInstance.post(endpoint, payload);
      refetch();
      enqueueSnackbar('Update success!');
      onClose();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        enqueueSnackbar(error?.response?.data?.message, { variant: 'error' });
      } else {
        enqueueSnackbar(error?.message || 'Something went wrong', { variant: 'error' });
      }
      console.error(error);
    }
  });

  useEffect(() => {
    for (const file of Object.keys(documentsList)) {
      if (!documentsList[file]) continue;

      const documentUrl = resolveS3Url(documentsList[file]);
      if (documentUrl) {
        setValue(`${file}-preview`, documentUrl);
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
