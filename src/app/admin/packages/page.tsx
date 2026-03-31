import { redirect } from "next/navigation";

export default function AdminPackagesRedirectPage() {
  redirect("/admin/dashboard/packages");
}
