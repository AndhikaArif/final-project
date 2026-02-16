import { JwtPayload } from "jsonwebtoken";
import type { Role, AuthProvider } from "../generated/prisma/enums.ts";
export type AuthJsProvider = "google" | "facebook" | "credentials";

export class CustomJwtPayload implements JwtPayload {
  authAccountId!: string;
  role!: Role;
}

export interface AuthJsPayload {
  email: string;
  provider: AuthJsProvider;
}

export class IRegisterPayload {
  email!: string;
  role!: Role;

  // USER
  name?: string | undefined;

  // TENANT
  storeName?: string | undefined;
  storeAddress?: string | undefined;
}

export class IRegisterSocialPayload {
  email!: string;
  role!: Role;
  provider!: "GOOGLE" | "FACEBOOK";

  // USER
  name?: string | undefined;

  // TENANT
  storeName?: string | undefined;
  storeAddress?: string | undefined;
}

export class ILoginSocialPayload {
  email!: string;
  role!: Role;
  provider!: AuthProvider;
}

export class IVerifyEmailPayload {
  token!: string;
  password!: string;
}

export class ILoginPayload {
  email!: string;
  password!: string;
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
