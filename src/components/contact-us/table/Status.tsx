import { Clock, Loader2, CheckCircle2 } from "lucide-react";

export const statuses = [
  {
    value: "PENDING",
    label: "Pending",
    icon: Clock, // ⏰ clear "waiting"
  },
  {
    value: "PROCESSING",
    label: "Processing",
    icon: Loader2, // 🔄 conveys "in progress / working"
  },
  {
    value: "COMPLETED",
    label: "Completed",
    icon: CheckCircle2, // ✅ clear "done/success"
  },
];
