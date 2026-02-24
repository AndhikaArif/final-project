"use client";

import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  registerSchemaFront,
  type RegisterFormType,
} from "@/validation/register.validation";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import AutoSave from "@/components/auto-save";
import LoadingScreen from "@/components/loading-screen";
import { useAuth } from "@/context/auth-context";

export default function RegisterPage() {
  const router = useRouter();

  // Ambil sessionStorage sekali saat mount
  const [savedValues, setSavedValues] = useState({
    email: "",
    role: "USER",
    name: "",
    storeName: "",
    storeAddress: "",
  });

  useEffect(() => {
    async function getSessionData() {
      const stored = sessionStorage.getItem("form");
      if (stored) {
        setSavedValues(JSON.parse(stored));
      }
    }

    getSessionData();
  }, []);

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;
  if (user) return null;

  function RoleEffect() {
    const { values, setFieldValue, setFieldTouched, setFieldError } =
      useFormikContext<RegisterFormType>();

    useEffect(() => {
      if (values.role === "USER") {
        setFieldValue("storeName", "");
        setFieldValue("storeAddress", "");

        setFieldTouched("storeName", false);
        setFieldTouched("storeAddress", false);

        setFieldError("storeName", undefined);
        setFieldError("storeAddress", undefined);
      }

      if (values.role === "TENANT") {
        setFieldValue("name", "");
        setFieldTouched("name", false);
        setFieldError("name", undefined);
      }
    }, [values.role, setFieldValue, setFieldTouched, setFieldError]);

    return null;
  }

  return (
    <main>
      <div className="max-w-md mx-auto p-6 border rounded-xl mt-10">
        <h2 className="text-xl font-semibold mb-4">Register</h2>

        <Formik
          initialValues={savedValues}
          enableReinitialize
          validationSchema={toFormikValidationSchema(registerSchemaFront)}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              const cleaned = Object.fromEntries(
                Object.entries(values).filter(
                  ([, value]) => value !== "" && value !== undefined,
                ),
              );

              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/register`,
                cleaned,
                { withCredentials: true },
              );

              sessionStorage.removeItem("form");

              if (response.data.emailSent) {
                toast.success(response.data.message);

                setTimeout(() => {
                  router.replace("/login");
                }, 1500);
              } else {
                toast.error(response.data.message);
              }

              return;
            } catch (err: unknown) {
              if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.message;

                if (msg === "Email already registered") {
                  setErrors({ email: msg });
                } else {
                  toast.error(msg || "Registration failed");
                }
              } else {
                console.error("Unexpected error:", err);
              }

              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values }) => {
            if (isSubmitting) {
              return <LoadingScreen />;
            }
            return (
              <>
                <AutoSave />
                <Form className="flex flex-col gap-4">
                  <RoleEffect />
                  {/* ROLE */}
                  <div className="flex flex-col gap-1">
                    <label className="font-medium">Register As</label>
                    <Field
                      as="select"
                      name="role"
                      className="border p-2 rounded bg-black text-white"
                    >
                      <option value="USER">User</option>
                      <option value="TENANT">Tenant</option>
                    </Field>
                  </div>

                  {/* NAME */}
                  {values.role === "USER" && (
                    <div className="flex flex-col gap-1">
                      <label className="font-medium">Name</label>
                      <Field
                        name="name"
                        placeholder="Name"
                        className={`border p-2 rounded bg-black text-white`}
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                  )}

                  {/* STORE FIELDS - ONLY TENANT */}
                  {values.role === "TENANT" && (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="font-medium">Store Name</label>
                        <Field
                          name="storeName"
                          placeholder="Store Name"
                          className="border p-2 rounded bg-black text-white"
                        />
                        <ErrorMessage
                          name="storeName"
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-medium">Store Address</label>
                        <Field
                          name="storeAddress"
                          placeholder="Store Address"
                          className="border p-2 rounded bg-black text-white"
                        />
                        <ErrorMessage
                          name="storeAddress"
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* EMAIL */}
                  <div className="flex flex-col gap-1">
                    <label className="font-medium">Email</label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Email"
                      className={`border p-2 rounded bg-black text-white`}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`p-2 rounded transition duration-300 cursor-pointer ${
                      isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-110"
                    } bg-white text-black`}
                  >
                    {isSubmitting ? "Processing..." : "Register"}
                  </button>
                </Form>
              </>
            );
          }}
        </Formik>
      </div>
    </main>
  );
}
