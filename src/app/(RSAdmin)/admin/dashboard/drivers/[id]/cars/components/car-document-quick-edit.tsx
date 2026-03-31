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
import { endpoints } from "@/lib/utils/axios";
import axios from "axios";
import { resolveS3Url } from '@/lib/api';

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
  setChangeFlag: Dispatch<SetStateAction<boolean>>;
}

export default function CarDocQuickEditForm({
  title,
  currentData,
  open,
  onClose,
  documentId,
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
    const formData = new FormData();

    for (const key in data) {
      if (
        data[key] !== null &&
        data[key] !== undefined &&
        !key.endsWith("preview")
      ) {
        formData.append(key, data[key] as any);
      }
    }
    formData.append("documentType", currentData.documentTitle);
    try {
      const response = await axios.put(
        endpoints.cars.carDocUpdate("null", documentId),
        formData
      );
      if (response.status === 200) {
        setChangeFlag((prev) => !prev);
        enqueueSnackbar("Update success!");
        onClose();
      }
    } catch (error: any) {
      if (error?.response?.data?.message) {
        enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
      } else {
        enqueueSnackbar("something went wrong", { variant: "error" });
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
  setChangeFlag: PropTypes.func,
};
