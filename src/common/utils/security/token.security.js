import jwt from "jsonwebtoken";

import { AudienceEnum, RoleEnum, TokenTypeEnum } from "../../enums/index.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  SYSTEM_ACCESS_TOKEN_SECRET_KEY,
  SYSTEM_REFRESH_TOKEN_SECRET_KEY,
  USER_ACCESS_TOKEN_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
} from "../../../../config/config.service.js";
import {
  BadRequestException,
  NotFoundException,
  UnAuthorizedException,
} from "../response/error.response.js";
import { User } from "../../../DB/models/user.model.js";
import { findById } from "../../../DB/db.repository.js";

//get signture level
export const getSigntureLevel = async (audienceType) => {
  let signtureLevel;
  switch (audienceType) {
    case AudienceEnum.System:
      signtureLevel = RoleEnum.System;
      break;

    default:
      signtureLevel = RoleEnum.User;
      break;
  }
  return signtureLevel;
};

//get signture
export const getTokenSignture = async (role) => {
  let accessSign = undefined;
  let refreshSign = undefined;
  let audience = AudienceEnum.User;
  switch (role) {
    case RoleEnum.System:
      accessSign = SYSTEM_ACCESS_TOKEN_SECRET_KEY;
      refreshSign = SYSTEM_REFRESH_TOKEN_SECRET_KEY;
      audience = AudienceEnum.System;
      break;

    default:
      accessSign = USER_ACCESS_TOKEN_KEY;
      refreshSign = USER_REFRESH_TOKEN_SECRET_KEY;
      audience = AudienceEnum.User;
      break;
  }

  return { accessSign, refreshSign, audience };
};

//generate token
export const generateToken = async ({
  payload = {},
  sign = USER_ACCESS_TOKEN_KEY,
  options = {},
} = {}) => {
  return jwt.sign(payload, sign, options);
};

//create login credentials
export const createLoginCredentials = async (user) => {
  const { accessSign, refreshSign, audience } = await getTokenSignture(
    user.role,
  );
  const accessToken = await generateToken({
    payload: { sub: user._id },
    sign: accessSign,
    options: {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      audience: [TokenTypeEnum.Access, audience],
    },
  });
  const refreshToken = await generateToken({
    payload: { sub: user._id },
    sign: refreshSign,
    options: {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      audience: [TokenTypeEnum.Refresh, audience],
    },
  });

  return { accessToken, refreshToken };
};

//verify token
export const verifyToken = async ({
  token,
  key = USER_ACCESS_TOKEN_KEY,
  options = {},
} = {}) => {
  return jwt.verify(token, key, options);
};

export const decodeToken = async ({
  token,
  tokenType = TokenTypeEnum.Access,
} = {}) => {
  const decode = jwt.decode(token);
  if (!decode?.aud?.length) {
    return BadRequestException("fail to decode this token");
  }
  const [decodedTokenType, audienceType] = decode.aud;
  if (decodedTokenType !== tokenType) {
    return BadRequestException(
      `invalid token type you pass ${decodedTokenType} and we want ${tokenType}`,
    );
  }
  const signtureLevel = await getSigntureLevel(audienceType);
  const { accessSign, refreshSign } = await getTokenSignture(signtureLevel);
  const verifiedData = await verifyToken({
    token,
    key: tokenType === TokenTypeEnum.Access ? accessSign : refreshSign,
  });

  const user = await findById({
    model: User,
    id: verifiedData.sub,
    select: "-email -password",
    options: { lean: true },
  });
  if (!user) {
    return UnAuthorizedException("Register and login first");
  }

  return user;
};
