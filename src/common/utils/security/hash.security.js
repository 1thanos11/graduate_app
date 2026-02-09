import bcrypt from "bcrypt";

export const generateHash = async ({ text, round, minor = "b" }) => {
  const salt = await bcrypt.genSalt(round, minor);
  const hashResult = await bcrypt.hash(text, salt);

  return hashResult;
};

export const compare = async ({ plaintext, hash }) => {
  const compareResult = await bcrypt.compare(plaintext, hash);

  return compareResult;
};
