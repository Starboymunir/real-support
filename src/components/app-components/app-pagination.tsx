"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useCallback, useMemo } from "react";

interface AppPaginationProps {
  totalPages: number;
}

export default function AppPagination({ totalPages }: AppPaginationProps) {
  const params = useSearchParams();
  const paramsObject = useMemo(() => Object.fromEntries(params), [params]);
  const router = useRouter();

  const currentPage = useMemo(() => +(params.get("page") ?? 1), [params]);
  const perPage = useMemo(() => +(params.get("count") ?? 20), [params]);

  const onPageChange = useCallback(
    (page: number, count: number) => {
      const urlParams = new URLSearchParams(paramsObject);

      urlParams.set("count", count.toString());
      urlParams.set("page", page.toString());
      router.push("?" + urlParams.toString());
    },
    [paramsObject, router],
  );

  return (
    <Card className={"flex gap-3 items-center w-fit p-3 text-nowrap"}>
      Count
      <Select
        key={perPage}
        value={perPage?.toString() ?? "20"}
        onValueChange={(e) => {
          onPageChange?.(currentPage, +e);
        }}
      >
        <SelectTrigger className={"w-14 me-3"}>{perPage ?? 20}</SelectTrigger>
        <SelectContent>
          <SelectItem value={"5"}>5</SelectItem>
          <SelectItem value={"10"}>10</SelectItem>
          <SelectItem value={"20"}>15</SelectItem>
          <SelectItem value={"20"}>20</SelectItem>
        </SelectContent>
      </Select>
      <ChevronFirst
        className={cn("hover:bg-primary/50 cursor-pointer rounded-md", {
          "text-muted-foreground pointer-events-none": currentPage == 1,
        })}
        onClick={() => onPageChange?.(1, perPage)}
      />
      <ChevronLeft
        className={cn("hover:bg-primary/50 cursor-pointer rounded-md", {
          "text-muted-foreground pointer-events-none": currentPage == 1,
        })}
        onClick={() => onPageChange?.(currentPage - 1, perPage)}
      />
      <div className={"text-nowrap mx-3"}>
        {currentPage} - {totalPages}
      </div>
      <ChevronRight
        className={cn("hover:bg-primary/50 cursor-pointer rounded-md", {
          "text-muted-foreground pointer-events-none":
            currentPage == totalPages,
        })}
        onClick={() => onPageChange?.(currentPage + 1, perPage)}
      />
      <ChevronLast
        className={cn("hover:bg-primary/50 cursor-pointer rounded-md", {
          "text-muted-foreground pointer-events-none":
            currentPage == totalPages,
        })}
        onClick={() => onPageChange?.(totalPages, perPage)}
      />
    </Card>
  );
}
