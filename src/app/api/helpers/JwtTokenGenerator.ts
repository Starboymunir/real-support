import jwt from "jsonwebtoken";

type User = {
  id: string;
  emailAddress: string | null;
  [key: string]: any;
};

const generateToken = (obj: User) => {
  return jwt.sign(obj, "absd", {
    expiresIn: "12h",
  });
};
export default generateToken;
