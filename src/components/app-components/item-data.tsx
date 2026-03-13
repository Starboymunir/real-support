import { cn } from "@/lib/utils";

export default function ItemData({
  title,
  data,
  className,
}: {
  title: React.ReactNode,
  data?: React.ReactNode,
  className?: string,
}) {
  return (
    <div className={cn("mt-3 flex-1", className)}>
      <h2 className="font-semibold">{title}</h2>
      <p className="text-muted-foreground"> {data}</p>
    </div>
  );
}
