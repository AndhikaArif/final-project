"use client";

import axios from "axios";
import { Formik, Form } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/auth-context";

import PasswordField from "@/components/form/passwordField";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(5, "Password must be at least 5 characters"),
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { forceLogout } = useAuth();

  if (!token) {
    return (
      <main className="max-w-md mx-auto p-6 mt-10 border rounded-xl">
        <h1 className="text-xl font-semibold mb-4">Invalid reset link</h1>
        <p>This reset link is invalid or missing token.</p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6 mt-10 border rounded-xl">
      <h1 className="text-xl font-semibold mb-4">Reset Password</h1>

      <Formik
        initialValues={{ newPassword: "" }}
        validationSchema={toFormikValidationSchema(resetPasswordSchema)}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/reset-password`,
              {
                token,
                newPassword: values.newPassword,
              },
            );

            toast.success("Password has been reset! Please login again.");
            forceLogout();

            router.replace("/login");
          } catch {
            toast.error("Failed to reset password.");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <PasswordField
              name="newPassword"
              label="Password"
              placeholder="Enter Password"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full p-2 rounded bg-white text-black hover:scale-105 duration-300 cursor-pointer"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </Form>
        )}
      </Formik>
    </main>
  );
}
