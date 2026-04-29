// components/auth/AuthForm.tsx

import { useState } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import OtpInput from "../ui/OtpInput";
import { useFormik } from "formik";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [otpValue, setOtpValue] = useState("");
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      countryCode: "+91",
      phone: "",
    },

    onSubmit: async (values) => {
      if (step === "request") {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/otp/request`,
            {
              countryCode: values.countryCode,
              phone: values.phone,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log(res);

          if (res.status === 201) {
            Swal.fire({
              title: "Success!!",
              text: "OTP Sent Successfully",
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });

            // Auto-fill OTP if it's returned (dev mode)
            if (res.data && res.data.devCode) {
              setOtpValue(res.data.devCode);
            }

            setStep("verify");
          }
        } catch (error) {
          console.error("REQUEST ERROR ", error);
          let errorMessage = "Failed to send OTP";
          if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || errorMessage;
          }
          Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
          });
        }
      } else {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/admin/otp/login`,
            {
              countryCode: values.countryCode,
              phone: values.phone,
              code: otpValue,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (res.status === 201) {
            Swal.fire({
              title: "Success!!",
              text: "Login Successful",
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });
            localStorage.setItem('accessToken', res?.data?.accessToken);
            navigate('/dashboard');
          }
        } catch (error) {
          console.error("VERIFY ERROR ", error);
          let errorMessage = "Invalid OTP";
          if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || errorMessage;
          }
          Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
          });
        }
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-8 px-4">
      <div className="space-y-1">
        <h1 className="text-[56px] font-bold font-bricolage leading-14">
          <span className="text-text-muted/30 block mb-1">Welcome to</span>
          <span className="text-text-primary">Best Bonds</span>
        </h1>
        <p className="text-text-primary text-[16px] font-medium tracking-wide">
          {step === "request"
            ? "Verify and Sign In to assess your rewards."
            : "Enter the OTP sent to your mobile number."}
        </p>
      </div>

      <div className="space-y-6">
        {step === "request" ? (
          <InputField
            label="Enter Mobile"
            placeholder="Enter Mobile"
            type="tel"
            name="phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
          />
        ) : (
          <div className="space-y-4">
            <label className="text-[12px] font-semibold text-text-secondary tracking-wider uppercase ml-1">
              Verification Code
            </label>
            <div className="flex justify-center">
              <OtpInput
                length={6}
                value={otpValue}
                onChange={(val) => setOtpValue(val)}
              />
            </div>
            <p className="text-sm text-center text-text-secondary">
              Didn't receive code?{" "}
              <span
                onClick={() => setStep("request")}
                className="text-brand-orange font-bold cursor-pointer hover:underline"
              >
                Resend
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="py-4">
        <Button type="submit">
          {step === "request" ? "Get OTP" : "Verify OTP"}
        </Button>
      </div>

      <p className="text-[14px] font-medium text-text-secondary tracking-wide text-center leading-5 max-w-[300px] mx-auto">
        By logging in, you agree to our{" "}
        <span className="text-brand-orange hover:underline cursor-pointer">
          Terms of Service
        </span>{" "}
        and{" "}
        <span className="text-brand-orange hover:underline cursor-pointer">
          Privacy Policy
        </span>
      </p>
    </form>
  );
};

export default AuthForm;