import crypto from "node:crypto";
import { ENCRYPTION_SECRET_KEY } from "../../../../config/config.service.js";

const IV_LENGTH = 16;
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_SECRET_KEY);

//encrypt
export const encrypt = async (plaintext) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encryptedData = cipher.update(plaintext, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}:${encryptedData}`;
};

//decrypt
export const decrypt = async (encryptedData) => {
  const [iv, encryptedText] = encryptedData.split(":");
  const binaryLikeIv = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    binaryLikeIv,
  );
  let plaintext = decipher.update(encryptedText, "hex", "utf8");
  plaintext += decipher.final("utf-8");

  return plaintext;
};
