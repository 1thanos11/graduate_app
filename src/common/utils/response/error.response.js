export const GlobalErrorException = (error, req, res, next) => {
  const status = error.cause?.status ?? 500;
  const error_msg = error.message ?? error;

  return res.status(status).json({ error_msg, error_stack: error.stack });
};

export const ErrorException = ({
  message = "fail",
  cause = undefined,
} = {}) => {
  throw new Error(message, { cause });
};

export const ConfilctException = async (message = "conflict", extra = {}) => {
  throw ErrorException({ message, cause: { status: 409, extra } });
};

export const InvalidCredentialsException = async (
  message = "invalid credentials",
  extra = {},
) => {
  throw ErrorException({ message, cause: { status: 400, extra } });
};

export const NotFoundException = async (message = "not found", extra = {}) => {
  throw ErrorException({ message, cause: { status: 404 }, extra });
};

//bad request
export const BadRequestException = async (
  message = "bad request",
  extra = {},
) => {
  throw ErrorException({ message, cause: { status: 400, extra } });
};

//unauthorized
export const UnAuthorizedException = async (
  message = "unauthorized action",
  extra = {},
) => {
  throw ErrorException({ message, cause: { status: 401, extra } });
};

//forbidden
export const ForbiddenException = async (message = "forbidden", extra = {}) => {
  throw ErrorException({ message, cause: { status: 403, extra } });
};
