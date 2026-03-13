"use client";

import {  useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Card, Container, Stack, Typography, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CustomBreadcrumbs from '../../../common/custom-breadcrumbs';
import { useSettingsContext } from '../../../common/settings';
import FormProvider, { RHFTextField,RHFEditor } from '@/app/(RSAdmin)/admin/common/hook-form';
import { getStaticContentByType, updateStaticContent } from '@/server/StaticContent';
import { LoadingScreen } from '../../../common/loading-screen';
import { useSnackbar } from 'notistack';


const AboutContent = () => {
  const { themeStretch } = useSettingsContext();
  const [loadingContent, setLoadingContent] = useState(false);
  const [currentData, setCurrentData] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const fetchData = async (type) => {
    setLoadingContent(true);
    try {
      const response = await getStaticContentByType(type);

      console.log("Response Static Content",response)
      setCurrentData(response?.data);
      setValue("title",response?.data?.title)
      setValue("description",response?.data?.description)
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingContent(false);
    }
  };

  const NewContentSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
  });

  const defaultValues =
    {
      title:  "",
      description: "",
    }


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
    fetchData('aboutUs');
  }, []);

  const onSubmit = async (values) => {
    console.log("values=====",values)
    
    try {
      const response = await updateStaticContent(currentData.id, values);
      if (response.statusCode === 200) {
        enqueueSnackbar("Content Updated Successfully");
        return;
      }
      enqueueSnackbar(response?.message,{variant:"error"});
    } catch (error) {
      console.error(error);
      enqueueSnackbar(response?.message,{variant:"error"});
    }
  };

  return (
    <>
      {loadingContent && <LoadingScreen />}
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs heading="About" links={[{ name: 'Dashboard' }, { name: 'Content' }, { name: 'About Us' }]} />

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <RHFTextField name="title" label="Title" />

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

export default AboutContent;
