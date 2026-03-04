"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

import { toFormikValidationSchema } from "zod-formik-adapter";
import { loginSchemaFront } from "@/validation/login.validation";
import { useAuth } from "@/context/auth-context";
import PasswordField from "@/components/form/passwordField";
import LoadingScreen from "@/components/loading-screen";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser, user, loading } = useAuth();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [socialProvider, setSocialProvider] = useState<
    "google" | "facebook" | null
  >(null);

  function startSocialLogin(provider: "google" | "facebook") {
    setSocialProvider(provider);
  }

  async function confirmSocialLogin(role: "USER" | "TENANT") {
    if (!socialProvider) return;

    // simpan role dulu
    localStorage.setItem("social-role", role);

    // redirect ke OAuth
    await signIn(socialProvider, {
      callbackUrl: "/login?social=done",
    });
  }

  const { status } = useSession();
  const socialHandled = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    const url = new URL(window.location.href);
    const isSocialDone = url.searchParams.get("social");

    if (isSocialDone !== "done") return;

    if (socialHandled.current) return;
    socialHandled.current = true;

    const role = localStorage.getItem("social-role") as
      | "USER"
      | "TENANT"
      | null;

    if (!role) return;

    const handleSocialLogin = async () => {
      try {
        const res = await fetch("/api/get-auth-token");

        if (!res.ok) {
          localStorage.removeItem("social-role");
          return;
        }

        const data = await res.json();

        if (!data.token) {
          localStorage.removeItem("social-role");
          toast.error("Failed to retrieve session token.");
          return;
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/social/login`,
          { role },
          {
            headers: { Authorization: `Bearer ${data.token}` },
            withCredentials: true,
          },
        );

        localStorage.removeItem("social-role");
        window.history.replaceState({}, document.title, "/login");

        await refreshUser();
        router.replace("/");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;

          if (status === 404) {
            router.push(`/social-register?role=${role}`);
            return;
          }

          if (status === 401) {
            localStorage.removeItem("social-role");
            toast.error("Session expired. Please login again.");
            router.replace("/login");
            return;
          }

          if (status === 403) {
            toast.error(
              "This email is already registered using a different login method. Please sign in using the original provider.",
            );
            localStorage.removeItem("social-role");
            return;
          }

          if (status === 429) {
            toast.error("Too many attempts. Please try again later.");
            return;
          }

          if (status && status >= 500) {
            toast.error("Server is currently unavailable.");
            return;
          }

          if (err.response?.data?.message) {
            toast.error(err.response.data.message);
            return;
          }
        }

        toast.error("Unable to login with social account.");
      }
    };

    handleSocialLogin();
  }, [status, refreshUser, router]);

  useEffect(() => {
    if (localStorage.getItem("session-expired")) {
      toast.error("Session expired, please login again");
      localStorage.removeItem("session-expired");
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;
  if (user) return null;

  return (
    <main>
      <div className="max-w-md mx-auto p-6 border rounded-xl mt-10">
        <h2 className="text-xl font-semibold mb-4">Login</h2>

        {/* SOCIAL BUTTONS */}
        <div className="flex flex-col gap-2 mb-4">
          <button
            type="button"
            onClick={() => startSocialLogin("google")}
            className="border p-2 rounded bg-white hover:bg-gray-200 text-black hover:scale-105 transition cursor-pointer"
          >
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => startSocialLogin("facebook")}
            className="border p-2 rounded bg-white hover:bg-gray-200 text-black hover:scale-105 transition cursor-pointer"
          >
            Continue with Facebook
          </button>
        </div>

        {/* FORM LOGIN */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={toFormikValidationSchema(loginSchemaFront)}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            setGlobalError(null);

            try {
              await axios.post(
                `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/login`,
                values,
                { withCredentials: true },
              );

              await refreshUser();
              router.replace("/");
            } catch (err: unknown) {
              if (axios.isAxiosError(err)) {
                if (!err.response) {
                  setGlobalError(
                    "The server is experiencing problems. Please try again shortly.",
                  );
                  return;
                }

                const status = err.response.status;

                if (status === 400) {
                  setErrors({ password: "Invalid email or password" });
                  return;
                }

                if (status === 429) {
                  setGlobalError("Too many requests, try again later");
                  return;
                }

                if (status >= 500) {
                  setGlobalError(
                    "The service is currently unavailable. Please try again later.",
                  );
                  return;
                }
              }

              setGlobalError("An error occurred. Please try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) =>
            isSubmitting ? (
              <LoadingScreen />
            ) : (
              <Form className="flex flex-col gap-4">
                {globalError && (
                  <div className="bg-red-100 text-red-600 p-2 rounded text-sm">
                    {globalError}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="font-medium">Email</label>
                  <Field
                    name="email"
                    placeholder="Email"
                    className="border p-2 rounded bg-black text-white"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <PasswordField
                  name="password"
                  label="Password"
                  className="bg-black text-white"
                />

                <button
                  type="submit"
                  className="p-2 rounded bg-white text-black hover:scale-105 transition cursor-pointer"
                >
                  Login
                </button>

                <div className="text-sm text-right mt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </Form>
            )
          }
        </Formik>
      </div>

      {/* ROLE MODAL */}
      {socialProvider && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-[320px]">
            <h3 className="text-lg font-semibold mb-4">Login as</h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => confirmSocialLogin("USER")}
                className="border p-2 rounded hover:bg-gray-100 hover:scale-105 transition cursor-pointer"
              >
                User
              </button>

              <button
                onClick={() => confirmSocialLogin("TENANT")}
                className="border p-2 rounded hover:bg-gray-100 hover:scale-105 transition cursor-pointer"
              >
                Tenant / Store Owner
              </button>

              <button
                onClick={() => setSocialProvider(null)}
                className="text-sm mt-3 text-gray-500 hover:scale-105 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
