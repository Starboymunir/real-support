import { Button } from "./ui/button";

const ButtonWithIcon = ({
  icon,
  text,
}: {
  icon: JSX.Element;
  text: string;
}) => (
  <Button variant="secondary" className="p-2 md:p-5 text-xs  mt-2">
    {icon}
    <span className="mr-3">{text}</span>
  </Button>
);

export default ButtonWithIcon;
