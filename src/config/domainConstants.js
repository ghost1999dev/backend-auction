export const EMAIL_DOMAINS = {
  CORPORATE: {
    ADMIN: 'admin.empresa.com',
    STAFF: 'staff.empresa.com',
    MAIN: 'empresa.com'
  },
  DEVELOPMENT: {
    TEST: 'test.empresa.com',
    DEV: 'dev.empresa.com'
  }
};

export const EMAIL_VALIDATION = {
  ALLOWED_DOMAINS: Object.values(EMAIL_DOMAINS.CORPORATE)
};
