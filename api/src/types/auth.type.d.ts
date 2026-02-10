import { JwtPayload } from "jsonwebtoken";
import type { Role, AuthProvider } from "../generated/prisma/enums.ts";

export class CustomJwtPayload implements JwtPayload {
  authAccountId!: string;
  role!: Role;
}

export class IRegisterPayload {
  email!: string;
  role!: Role;

  // USER
  name?: string;

  // TENANT
  storeName?: string;
  storeAddress?: string;
}

export class IRegisterSocialPayload {
  email!: string;
  role!: Role;
  provider!: "GOOGLE" | "FACEBOOK";

  // USER
  name?: string;

  // TENANT
  storeName?: string;
  storeAddress?: string;
}

export class IVerifyEmailPayload {
  token!: string;
  password!: string;
}

export class ILoginPayload {
  email!: string;
  password!: string;
  role!: Role;
}

export class IResetPasswordPayload {
  token!: string;
  newPassword!: string;
}

export class IExistingUserProfile {
  id!: string;
  email!: string;
  role!: Role;

  // USER
  name?: string;

  // TENANT
  storeName?: string;
  storeAddress?: string;
}
