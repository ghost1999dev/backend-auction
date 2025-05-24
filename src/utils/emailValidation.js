import { EMAIL_VALIDATION } from '../config/domainConstants.js';

export const isCorporateEmail = (email) => {
  const domain = email.split('@')[1];
  return EMAIL_VALIDATION.ALLOWED_DOMAINS.includes(domain);
};
