import CarDetailsView from "../components/view/car-details-view";

const CarDetails = async (props: { params: Promise<{ carId: string; driverId: string }> }) => {
    const params = await props.params;
    const { carId, driverId } = params;

    return (
        <div>
            <CarDetailsView id={carId} driverId={driverId} />
        </div>
    );
};

export default CarDetails;