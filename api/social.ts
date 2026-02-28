import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const token = jwt.sign(
  {
    email: "socialtest1@gmail.com",
    provider: "google", // HARUS lowercase sesuai AuthJsProvider
  },
  process.env.AUTHJS_SECRET as string,
  { expiresIn: "1h" },
);

console.log("SECRET SOCIAL:", process.env.AUTHJS_SECRET);
console.log("token : " + token);
