import Input from "../components/common/input";
import { useFormik } from "formik";
import Joi from "joi";
import { useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../../context/auth.context.jsx";
import { toast } from "react-hot-toast";

function LogIn() {
  const { user, logIn } = useAuth();
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { getFieldProps, handleSubmit, touched, errors, isValid } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validateOnMount: true,
    validate(values) {
      const schema = Joi.object({
        email: Joi.string()
          .required()
          .min(5)
          .email({ tlds: false })
          .label("Email"),
        password: Joi.string().min(6).max(20).label("Password").required(),
      });
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
        const response = await logIn({
          email: values.email,
          password: values.password,
        });
        navigate("/");
        toast.success("Welcome back!");
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(error);
          setServerError(error.response.data.message);
          toast.error("Invalid email or password");
        } else {
          console.log(error);
          toast.error("Something went wrong, please try again later.");
        }
      }
    },
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="d-flex flex-column p-5 gap-3 container flex-fill mx-auto justify-content-center"
    >
      {serverError && (
        <div className="alert alert-danger" role="alert">
          Invalid email or password
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
        {...getFieldProps("password")}
        name="password"
        label="Password"
        type="password"
        error=""
        required
      />
      <div className="my-2">
        <button
          disabled={!isValid}
          type="submit"
          className="btn btn-success col-8 col-md-4 mx-auto d-block"
        >
          Sign In
        </button>
      </div>
    </form>
  );
}

export default LogIn;