import { TokenTypeEnum } from "../common/enums/security.enum.js";
import {
  BadRequestException,
  ForbiddenException,
} from "../common/utils/response/error.response.js";
import { decodeToken } from "../common/utils/security/token.security.js";

//authentication
export const authentication = (tokenType = TokenTypeEnum.Access) => {
  return async (req, res, next) => {
    if (!req.headers?.authorization) {
      return BadRequestException("no token passed");
    }
    const [flag, token] = req.headers?.authorization.split(" ");
    req.user = await decodeToken({
      token: token,
      tokenType,
    });

    next();
  };
};

//authorization
export const authorization = (accessRoles = []) => {
  return async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return ForbiddenException();
    }
    next();
  };
};
