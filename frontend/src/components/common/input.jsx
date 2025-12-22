import React from "react";

function Input({ label, error, ...rest }) {
  if (error) {
    console.log(`Input component for "${rest.name}" received error:`, error);
  }

  const isTextArea = rest.type === "textarea";
  const isSelect = rest.type === "select";

  const hasErrorClass = !!error;

  const inputClasses = ["form-control"];
  if (hasErrorClass) {
    inputClasses.push("is-invalid");
  }

  let inputElement;
  if (isTextArea) {
    inputElement = (
      <textarea
        className={inputClasses.join(" ")}
        id={rest.name}
        {...rest}
      ></textarea>
    );
  } else if (isSelect) {
    inputElement = (
      <select className={inputClasses.join(" ")} id={rest.name} {...rest}>
        {rest.children.map((option, index) => (
          <option value={option.value || option} key={index}>
            {option.label || option}
          </option>
        ))}
      </select>
    );
  } else {
    inputElement = (
      <input className={inputClasses.join(" ")} id={rest.name} {...rest} />
    );
  }

  return (
    <div className={["mb-3", rest.width ? rest.width : ""].join(" ")}>
      <label htmlFor={rest.name} className="form-label">
        {label}{" "}
        {rest.required ? <span className="text-danger ms-1">*</span> : null}
      </label>
      {inputElement}
      {hasErrorClass && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

export default Input;