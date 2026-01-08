import { useState } from 'react'
import Input from "../../components/common/input.jsx";
import { useFormik } from "formik";
import Joi from "joi";
import { useNavigate } from "react-router";
import useAuth from "../../../context/auth.context.jsx";
import Button from "../../components/common/button.jsx";
import Header from "../../components/header.jsx";
import { toast } from "react-hot-toast";

export default function Register() {
    const { userData, register } = useAuth();
    const [serverError, setServerError] = useState("");
    const navigate = useNavigate();
    const { getFieldProps, handleSubmit, touched, errors, isValid } = useFormik({
      initialValues: {
        email: "",
        password: "",
        phone: "",
        name: "",
      },
      validateOnMount: true,
      validate(values) {
        const schema = Joi.object({
          email: Joi.string()
            .required()
            .min(5)
            .email({ tlds: false })
            .label("Email")
            .messages({
              "string.email": "Invalid email address",
              "string.empty": "Email is required",
              "string.min": "Email must be at least 5 characters long",
            }),
          password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[A-Za-z\d@$!%*?&]{8,}$/).label("Password").required().messages({
            "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number. Password must be at least 8 characters long",
            "string.empty": "Password is required",
          }),
          phone: Joi.string().required().pattern(/^[0-9]{10}$/).label("Phone").messages({
            "string.pattern.base": "Phone number must be 10 digits long",
            "string.empty": "Phone number is required",
          }),
          name: Joi.string().pattern(/^[a-zA-Z\u0590-\u05FF\s]+$/).required().min(3).max(50).label("Name").messages({
            "string.pattern.base": "Name must contain only letters and spaces",
              "string.empty": "Name is required",
            }),
        })
        const { error } = schema.validate(values, { abortEarly: false });
        if (!error) {
          return null;
        }
  
        const errors = {};
        for (let item of error.details) {
          errors[item.path[0]] = item.message;
        }
        return errors;
      },
  
      onSubmit: async (values) => {
        try {
          const response = await register({
            email: values.email,
            password: values.password,
            phone: values.phone,
            name: values.name,
          });
          toast.success("Registration successful! Please login to continue.");
          navigate("/login");
        } catch (error) {
          if (error.response?.status === 409) {
            toast.error("Email or phone number already exists");
          } else {
            toast.error("Something went wrong, please try again later.");
          }
        }
      },
    });

    if(userData) {
      navigate("/");
    }

    return (
        <div>
            <Header pageName="Register" pageDescription="Register page" />
            <form
      onSubmit={handleSubmit}
      className="d-flex flex-column p-5 gap-3 container flex-fill mx-auto justify-content-center align-items-center"
    >
      {serverError && (
        <div className="alert alert-danger" role="alert">
          Something went wrong, please try again later.
        </div>
      )}
      <Input
        {...getFieldProps("email")}
        name="email"
        label="Email"
        type="email"
        error={touched.email ? errors.email : ""}
        placeholder="name@domain.com"
        required
      />
      <Input
        {...getFieldProps("phone")}
        name="phone"
        label="Phone"
        type="text"
        error={touched.phone ? errors.phone : ""}
        placeholder="05XXXXXXXX"
        required
      />
      <Input
        {...getFieldProps("name")}
        name="name"
        label="Name"
        type="text"
        error={touched.name ? errors.name : ""}
        placeholder="John Doe"
        required
      />
      <Input
        {...getFieldProps("password")}
        name="password"
        label="Password"
        type="password"
        error={touched.password ? errors.password : ""}
        required
      />

        <Button
          disabled={!isValid}
          onClick={handleSubmit}
          text="Sign Up"
        />
        <Button
          onClick={() => navigate("/login")}
          text="Already have an account? Sign In"
        />

    </form>
        </div>
    )
}