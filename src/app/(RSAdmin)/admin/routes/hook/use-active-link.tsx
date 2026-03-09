import { usePathname } from 'next/navigation';


function normalizePath(p: string) {
  return p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p;
}

export function useActiveLink(path: string, deep = true): boolean {
  const pathname = normalizePath(usePathname());

  if (typeof path !== "string") return false;

  const checkPath = path.startsWith("#");
  const currentPath = normalizePath(path);

  const normalActive = !checkPath && pathname === currentPath;
  const deepActive = !checkPath && pathname.startsWith(currentPath);

  return deep ? deepActive : normalActive;
}

