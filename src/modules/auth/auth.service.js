import {
  ACCESS_TOKEN_EXPIRES_IN,
  CLIENT_IDS,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../../../config/config.service.js";
import {
  AudienceEnum,
  TokenTypeEnum,
} from "../../common/enums/security.enum.js";
import { ProviderEnum } from "../../common/enums/user.enum.js";
import {
  BadRequestException,
  ConfilctException,
  InvalidCredentialsException,
} from "../../common/utils/response/index.js";
import { encrypt } from "../../common/utils/security/encryption.security.js";
import {
  compare,
  generateHash,
} from "../../common/utils/security/hash.security.js";
import {
  createLoginCredentials,
  generateToken,
  getTokenSignture,
} from "../../common/utils/security/token.security.js";
import { create, findOne } from "../../DB/index.js";
import { User } from "../../DB/models/user.model.js";
import { OAuth2Client } from "google-auth-library";

//signup
export const signup = async (inputs) => {
  const { username, email, password, gender, phone } = inputs;
  const isEmailExist = await findOne({
    model: User,
    filter: { email },
  });

  if (isEmailExist) {
    return ConfilctException("email already exist");
  }
  const hashPassword = await generateHash({ text: password });
  const ecryptPhone = await encrypt(phone);
  const user = await create({
    model: User,
    data: [
      { username, email, password: hashPassword, gender, phone: ecryptPhone },
    ],
  });

  return user;
};

//login
export const login = async (inputs) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: User,
    filter: { email },
  });
  if (!user) {
    return InvalidCredentialsException();
  }
  const isValidPassword = await compare({
    plaintext: password,
    hash: user.password,
  });
  if (!isValidPassword) {
    return InvalidCredentialsException();
  }
  const { accessToken, refreshToken } = await createLoginCredentials(user);

  return { accessToken, refreshToken };
};

//verify google account
export const verifyGoogleAccount = async (idToken) => {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_IDS,
  });
  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    return BadRequestException("Fail to authenticte this account with google");
  }

  return payload;
};

//signup with gmail
export const signupWithGmail = async ({ idToken }) => {
  const payload = await verifyGoogleAccount(idToken);
  const user = await findOne({
    model: User,
    filter: { email: payload.email },
  });
  if (user) {
    if (user.provider == ProviderEnum.System) {
      return ConfilctException("email already signedup");
    }
    return await loginWithGmail({ idToken });
  }
  const newUser = await create({
    model: User,
    data: [
      {
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        provider: ProviderEnum.Google,
        profilePicture: payload.picture,
        confirmEmail: new Date(),
      },
    ],
  });

  return await createLoginCredentials(newUser);
};

//login with gmail
export const loginWithGmail = async ({ idToken }) => {
  const payload = await verifyGoogleAccount(idToken);
  const user = await findOne({
    model: User,
    filter: { email: payload.email, provider: ProviderEnum.Google },
  });
  if (!user) {
    return InvalidCredentialsException();
  }

  return await createLoginCredentials(user);
};
