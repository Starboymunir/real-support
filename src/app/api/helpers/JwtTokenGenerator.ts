import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
const generateToken = (obj: User) => {
  return jwt.sign(obj, "absd", {
    expiresIn: "12h",
  });
};
export default generateToken;
