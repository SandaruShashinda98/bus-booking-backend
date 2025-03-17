/*
 * The `isValidPassword` method that checks the validity of a password based on certain criteria.
 */
export const isValidPassword = (password: string) => {
  const hasValidLength = password.length >= 6 && password.length <= 20;
  if (!hasValidLength) return false;

  const hasValidUpperCaseCharLength = new RegExp(`(.*[A-Z]){1}`).test(password);
  if (!hasValidUpperCaseCharLength) return false;

  const hasValidSpecialCharLength = new RegExp(`(.*[?@#$%&!_-]){1}`).test(
    password,
  );
  if (!hasValidSpecialCharLength) return false;

  return true;
};
