import { useState, useEffect, useCallback } from "react";
import Collapse from "@mui/material/Collapse";
import { usePathname } from "@/app/(RSAdmin)/admin/routes/hook";
import { useActiveLink } from "@/app/(RSAdmin)/admin/routes/hook/use-active-link";
import NavItem from "./nav-item";

interface NavItemData {
  title: string;
  path: string;
  children?: NavItemData[];
}

interface NavListProps {
  data: NavItemData;
  depth: number;
  hasChild: boolean;
  config?: any;
}

export default function NavList({
  data,
  depth,
  hasChild,
  config,
}: NavListProps) {
  const pathname = usePathname();

  const active = useActiveLink(data.path, hasChild);

  const externalLink = data.path.includes("http");

  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (!active) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <NavItem
        item={data}
        depth={depth}
        open={open}
        active={active}
        externalLink={externalLink}
        onClick={handleToggle}
        config={config}
      />

      {hasChild && (
        <Collapse in={open} unmountOnExit>
          <NavSubList
            data={data.children ?? []}
            depth={depth}
            config={config}
          />
        </Collapse>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function NavSubList({
  data,
  depth,
  config,
}: {
  data: NavItemData[];
  depth: number;
  config?: any;
}) {
  return (
    <>
      {data.map((list) => (
        <NavList
          key={list.title + list.path}
          data={list}
          depth={depth + 1}
          hasChild={!!list.children}
          config={config}
        />
      ))}
    </>
  );
}
