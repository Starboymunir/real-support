import CompanyGuard from "@/app/guard/CompanyGuard";

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return <CompanyGuard>{children}</CompanyGuard>;
};

export default AuthenticatedLayout;
