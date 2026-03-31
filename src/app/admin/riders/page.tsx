import { redirect } from "next/navigation";

export default function AdminRidersRedirectPage() {
  redirect("/admin/dashboard/passengers");
}
