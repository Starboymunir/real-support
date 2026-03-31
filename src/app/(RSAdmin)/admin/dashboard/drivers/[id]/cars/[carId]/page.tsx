import CarDetailsView from "../components/view/car-details-view";

const CarDetails = async (props: { params: Promise<{ carId: string; id: string }> }) => {
    const params = await props.params;
    const { carId, id } = params;

    return (
        <div>
            <CarDetailsView id={carId} driverId={id} />
        </div>
    );
};

export default CarDetails;