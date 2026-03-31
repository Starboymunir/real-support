"use client";

import React, { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import CarDetailsToolbar from "../car-details-toolbar";
import CarDetailsInfo from "../car-details-info";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { Card, CardHeader, IconButton } from "@mui/material";
import Iconify from "@/components/iconify/iconify";
import CarDocQuickEditForm from "../car-document-quick-edit";
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks/use-boolean";
import axios from "axios";
import { endpoints } from "@/lib/utils/axios";
import { generateCarDocumentAccordionData } from "@/lib/utils";
import AwsImageRender from "@/app/(RSAdmin)/admin/common/aws-image-avatar/ImageRender";
import AccordionDocument from "../AccordionDocument";
import { Car } from "@/lib/interface-types/driver-types";

// Types
interface DocumentAccordionItem {
  name: string;
  documentsList: any;
  documentTitle: string;
}

interface CarDetailsViewProps {
  driverId: string;
  id: string;
}

export default function CarDetailsView({ driverId, id }: CarDetailsViewProps) {
  const [currentCar, setCurrentCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [paperDoc, setPaperDoc] = useState<DocumentAccordionItem[]>([]);
  const [forEdit, setForEdit] = useState<any>({});
  const [changeFlag, setChangeFlag] = useState<boolean>(true);
  const [titleForModal, setTitleForModal] = useState<string>("");

  const quickEdit = useBoolean();
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded);
    };

  const fetch = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, status } = await axios.get<Car>(
        endpoints.cars.byId(driverId, id)
      );
      if (status === 200) {
        setCurrentCar(data as Car);
        const accordenceData = generateCarDocumentAccordionData(
          data?.carDocument
        ) as DocumentAccordionItem[];
        setPaperDoc(accordenceData);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [changeFlag]);

  const handleForEdit = (data: {
    documentsList: any;
    documentTitle: string;
  }) => {
    console.log("data:", data);
    quickEdit.onTrue();
    setForEdit(data);
  };

  return (
    <>
      {loading || !currentCar ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth={"xl"}>
          <CarDetailsToolbar
            backLink={paths.dashboard.drivers.details(
              String(currentCar?.driverInfo?.id ?? driverId)
            )}
            car={currentCar as Car}
            setCurrentCar={setCurrentCar}
            setLoading={setLoading}
            setChangeFlag={setChangeFlag}
          />

          <Grid container spacing={3}>
            <Grid xs={12} md={4}>
              <CarDetailsInfo
                setLoading={setLoading}
                setChangeFlag={setChangeFlag}
                carDetail={currentCar}
              />
            </Grid>

            <Grid xs={12} md={8}>
              <Stack spacing={3} direction={{ xs: "column", md: "column" }}>
                <Card>
                  <AwsImageRender
                    imageKey={currentCar?.carImage}
                    alt="front"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain"
                    placeHolderImage={"/webAssets/images/placeholder/car.png"}
                  />
                </Card>
                <Card sx={{ bgcolor: "background.neutral" }}>
                  <CardHeader
                    title="Car's Documents"
                    action={
                      <IconButton>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                    }
                  />

                  <Stack spacing={1} sx={{ p: 3 }}>
                    {paperDoc?.map((document, index) => (
                      <AccordionDocument
                        info={currentCar?.carDocument}
                        key={index}
                        expanded={expanded}
                        handleChange={handleChange}
                        handleForEdit={handleForEdit}
                        name={document?.name}
                        documentsList={document?.documentsList}
                        documentTitle={document?.documentTitle}
                      />
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Grid>
          {currentCar?.carDocument ? (
            <CarDocQuickEditForm
              title={titleForModal}
              currentData={forEdit}
              documentId={currentCar?.carDocument?.id}
              carId={id}
              open={quickEdit.value}
              onClose={quickEdit.onFalse}
              setChangeFlag={setChangeFlag}
            />
          ) : null}
        </Container>
      )}
    </>
  );
}
