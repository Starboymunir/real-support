import PackageEditView from "../../_components/view/packages-edit-view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Package Edit",
};

interface PackageEditPageProps {
  params: {
    id: string;
  };
}

const PackageEditPage = async (props: any) => {
   const params = await props.params;
   const { id } = params;

  return <PackageEditView id={id} />;
}

export default PackageEditPage;