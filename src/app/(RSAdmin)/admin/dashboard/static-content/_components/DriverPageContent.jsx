"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Card, Container, Stack, Typography, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CustomBreadcrumbs from '../../../common/custom-breadcrumbs';
import { useSettingsContext } from '../../../common/settings';
import FormProvider, { RHFTextField, RHFEditor, RHFUpload } from '@/app/(RSAdmin)/admin/common/hook-form';
import { getStaticContentByType, updateStaticContent } from '@/server/StaticContent';
import { LoadingScreen } from '../../../common/loading-screen';
import { useSnackbar } from 'notistack';
import axiosInstance from '@/lib/admin-axios';
import { resolveImageUrl } from '@/lib/api';

const DriverPageContent = () => {
  const { themeStretch } = useSettingsContext();
  const [loadingContent, setLoadingContent] = useState(false);
  const [currentData, setCurrentData] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const fetchData = async (type) => {
    setLoadingContent(true);
    try {
      const response = await getStaticContentByType(type);
      setCurrentData(response?.data);
      setValue("title", response?.data?.title || "");
      setValue("description", response?.data?.description || "");
      if (response?.data?.coverImage) {
        setValue("coverImage", resolveImageUrl(response.data.coverImage) || response.data.coverImage);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingContent(false);
    }
  };

  const NewContentSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    coverImage: Yup.mixed().nullable(),
  });

  const defaultValues = {
    title: "",
    description: "",
    coverImage: null,
  };

  const methods = useForm({
    resolver: yupResolver(NewContentSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    fetchData('driverPage');
  }, []);

  const handleDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axiosInstance.post('/documents/upload_file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.fileUrl || res.data;
      setValue('coverImage', url, { shouldValidate: true });
    } catch (err) {
      console.error('Upload failed:', err);
      const preview = Object.assign(file, { preview: URL.createObjectURL(file) });
      setValue('coverImage', preview, { shouldValidate: true });
    }
  }, [setValue]);

  const handleRemoveCover = () => {
    setValue('coverImage', null);
  };

  const onSubmit = async (values) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
      };
      if (typeof values.coverImage === 'string') {
        payload.coverImage = values.coverImage;
      }
      const response = await updateStaticContent(currentData.id, payload);
      if (response.statusCode === 200) {
        enqueueSnackbar("Content Updated Successfully");
        return;
      }
      enqueueSnackbar(response?.message, { variant: "error" });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Something went wrong", { variant: "error" });
    }
  };

  return (
    <>
      {loadingContent && <LoadingScreen />}
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs heading="Driver Page" links={[{ name: 'Dashboard' }, { name: 'Content' }, { name: 'Driver Page' }]} />

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <RHFTextField name="title" label="Title" />

                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Cover Image
                    </Typography>
                    <RHFUpload
                      name="coverImage"
                      maxSize={5242880}
                      onDrop={handleDrop}
                      onDelete={handleRemoveCover}
                    />
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Description
                    </Typography>
                    <RHFEditor simple name="description" />
                  </Stack>
                </Stack>
                <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    Submit
                  </LoadingButton>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </FormProvider>
      </Container>
    </>
  );
};

export default DriverPageContent;
