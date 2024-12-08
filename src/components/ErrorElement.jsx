// eslint-disable-next-line no-unused-vars
import React from "react";
import { useRouteError } from "react-router-dom";

const ErrorElement = () => {
  const error = useRouteError();
  console.log(error);

  return (
    <div className="w-full flex flex-col flex-grow gap-5 justify-center items-center h-full min-h-[600px]">
      <h4 className="flex font-bold text-4xl">Opps</h4>
      <p className="flex flex-row justify-center items-center w-full">
        Sorry, The server is temporarily Unavialable
      </p>
      <p className="flex flex-row justify-center items-center w-full text-red-950">
        Not Found
      </p>
    </div>
  );
};
export default ErrorElement;
