"use client";

import { use } from "react";
import CompanyProfileView from "../_components/view/company-profile-view";

export default function CompanyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <CompanyProfileView id={id} />;
}
