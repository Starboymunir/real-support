import { UserEditView } from "../../_components/view";

export const metadata = {
  title: "Dashboard: User Edit",
};

export default async function UserEditPage(props: any) {
  const params = await props.params;
  const { id } = params;

  return <UserEditView id={id} />;
}
