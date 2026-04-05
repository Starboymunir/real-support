import { redirect } from "next/navigation";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";

const Page = async () => {
  redirect(paths.dashboard.workSummary.root);
};

export default Page;
