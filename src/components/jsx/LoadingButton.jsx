import React from "react";

const LoadingButton = ({ loading, text, color, type, handleSubmit, width }) => {
  return (
    <button
      disabled={loading}
      type={type}
      className={`outline-none border-none px-8 py-4 ${color} ${width} rounded-full font-poppins flex items-center justify-center  text-center`}
      onClick={handleSubmit}
    >
      {text}
      {loading ? (
        <span className="grid place-content-center w-12">
          <span
            className="w-5 h-5 rounded-full animate-spin
                border-4 border-solid border-black border-t-transparent"
          ></span>
        </span>
      ) : null}
    </button>
  );
};

export default LoadingButton;
