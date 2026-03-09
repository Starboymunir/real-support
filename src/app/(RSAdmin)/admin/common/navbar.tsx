import MainNav from '@/app/(RSAdmin)/admin/common/main-nav';
import ThemeToggle from '@/app/(RSAdmin)/admin/common/theme-toggle';

const Navbar = async () => {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="mr-16">This is my LOGO</div>
        <MainNav className="flex items-center mx-auto p-2 " />
        <div className="ml-auto flex item-center">BOOK NOW</div>
        <div className="ml-8 flex item-center">BECOME A DRIVER</div>
        <div className="ml-12 flex item-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
