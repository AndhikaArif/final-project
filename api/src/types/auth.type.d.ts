import { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
  authAccountId: string;
  role: "USER" | "TENANT";
}

export interface IRegister {
  name: string;
  email: string;
  password: string;
}

export interface IExistingUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
