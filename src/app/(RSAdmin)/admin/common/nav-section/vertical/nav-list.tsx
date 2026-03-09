import { useState, useEffect, useCallback } from "react";
// @mui
import Collapse from "@mui/material/Collapse";
// routes
import { usePathname } from "@/app/(RSAdmin)/admin/routes/hook";
import { useActiveLink } from "@/app/(RSAdmin)/admin/routes/hook/use-active-link";
//
import NavItem from "./nav-item";
import { useChatContext } from "@/providers/ChatDataProvider";

// ----------------------------------------------------------------------

interface NavItemData {
  title: string;
  path: string;
  children?: NavItemData[];
  // add other properties as needed
}

interface NavListProps {
  data: NavItemData;
  depth: number;
  hasChild: boolean;
  config?: any; // Replace 'any' with a more specific type if available
}

export default function NavList({
  data,
  depth,
  hasChild,
  config,
}: NavListProps) {
  const pathname = usePathname();
  const { unreadChatCount } = useChatContext();

  const active = useActiveLink(data.path, hasChild);

  const externalLink = data.path.includes("http");

  const isChatLink = data.path.includes("/chat");

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
        unReadCount={isChatLink ? unreadChatCount : 0}
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
