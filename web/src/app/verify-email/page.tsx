"use client";

import axios, { AxiosError } from "axios";
import { Formik, Form } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import PasswordField from "@/components/form/passwordField";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">Invalid Verification Link</h1>
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Set Your Password</h1>

      <Formik
        initialValues={{
          password: "",
          confirmPassword: "",
        }}
        onSubmit={async (values, { setSubmitting }) => {
          if (values.password !== values.confirmPassword) {
            toast.error("Password confirmation does not match");
            setSubmitting(false);
            return;
          }

          if (!values.password.trim()) {
            toast.error("Password is required");
            setSubmitting(false);
            return;
          }

          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/verify-email`,
              {
                token,
                password: values.password,
              },
            );

            toast.success("Account verified successfully");

            setTimeout(() => {
              router.replace("/login");
            }, 1500);
          } catch (err) {
            const error = err as AxiosError<{ message: string }>;

            const message = error.response?.data?.message;

            if (message === "Verification token expired") {
              toast.error(
                "Verification link expired. Please request a new one.",
              );
            } else {
              toast.error(message || "Verification failed");
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <PasswordField
              name="password"
              label="Password"
              placeholder="Enter Password"
            />

            <PasswordField
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm Password"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:scale-110 duration-300 cursor-pointer"
            >
              {isSubmitting ? "Verifying..." : "Verify Account"}
            </button>
          </Form>
        )}
      </Formik>
    </main>
  );
}
