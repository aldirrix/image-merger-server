type ExecutionError = {
  code: number,
  message: string,
}

const ERRORS = {
  NOT_FOUND: { code: 404, message: "Not Found" },
  SERVER_ERROR: { code: 500, message: 'Internal server error' },
};

export const handleError = (error: Error): ExecutionError => {
  if (error.message === "404") {
    return ERRORS.NOT_FOUND;
  } else {
    return ERRORS.SERVER_ERROR;
  }
}
