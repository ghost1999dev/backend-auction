// import package to hash password
import crypto from "crypto";

/**
 *Encrypt password
 *
 * function to hash password
 * @param {string} password - password to be hashed
 * @returns {string} hashed password
 */
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

export default hashPassword;
