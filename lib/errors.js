const ERROR_DEFINITIONS = {
  "auth/invalid-email": {
    code: "INVALID_EMAIL",
    message: "Enter a valid email address.",
    action: "correct",
    severity: "error",
  },
  "auth/weak-password": {
    code: "WEAK_PASSWORD",
    message: "Choose a stronger password and try again.",
    action: "correct",
    severity: "error",
  },
  "auth/email-already-in-use": {
    code: "ACCOUNT_CREATION_FAILED",
    message:
      "We couldn't create your account with those details. Try signing in or use a different email.",
    action: "signin",
    severity: "error",
  },
  "auth/invalid-credential": {
    code: "INVALID_CREDENTIALS",
    message: "The email or password is incorrect.",
    action: "correct",
    severity: "error",
  },
  "auth/user-disabled": {
    code: "ACCOUNT_UNAVAILABLE",
    message:
      "This account is currently unavailable. Please contact Zwey support.",
    action: "support",
    severity: "error",
  },
  "auth/too-many-requests": {
    code: "RATE_LIMITED",
    message:
      "Too many attempts. Please wait a moment and try again.",
    action: "retry",
    severity: "warning",
  },
  "auth/network-request-failed": {
    code: "NETWORK_ERROR",
    message:
      "We couldn't connect to Zwey. Check your connection and try again.",
    action: "retry",
    severity: "error",
  },
  "auth/requires-recent-login": {
    code: "RECENT_LOGIN_REQUIRED",
    message:
      "Please sign in again before making that change.",
    action: "signin",
    severity: "warning",
  },
  "auth/popup-closed-by-user": {
    code: "SIGN_IN_CANCELLED",
    message: "Sign-in was cancelled.",
    action: "retry",
    severity: "info",
  },
  "auth/cancelled-popup-request": {
    code: "SIGN_IN_CANCELLED",
    message: "Sign-in was cancelled.",
    action: "retry",
    severity: "info",
  },
  "auth/operation-not-allowed": {
    code: "AUTH_METHOD_UNAVAILABLE",
    message:
      "That sign-in method is currently unavailable.",
    action: "retry",
    severity: "error",
  },
  "auth/account-exists-with-different-credential": {
    code: "AUTH_METHOD_CONFLICT",
    message:
      "That email may already use another sign-in method. Try a different method.",
    action: "signin",
    severity: "error",
  },
  "permission-denied": {
    code: "PERMISSION_DENIED",
    message:
      "We couldn't complete that action. Please try again.",
    action: "retry",
    severity: "error",
  },
  "not-found": {
    code: "NOT_FOUND",
    message: "We couldn't find that content.",
    action: "back",
    severity: "error",
  },
  "already-exists": {
    code: "ALREADY_EXISTS",
    message: "That item already exists.",
    action: "correct",
    severity: "error",
  },
  "failed-precondition": {
    code: "FAILED_PRECONDITION",
    message:
      "We couldn't complete that action. Please try again.",
    action: "retry",
    severity: "error",
  },
  "unavailable": {
    code: "SERVICE_UNAVAILABLE",
    message:
      "Zwey is temporarily unavailable. Please try again.",
    action: "retry",
    severity: "warning",
  },
  "deadline-exceeded": {
    code: "REQUEST_TIMEOUT",
    message:
      "That request took too long. Please try again.",
    action: "retry",
    severity: "warning",
  },
  "resource-exhausted": {
    code: "RESOURCE_LIMIT",
    message:
      "Zwey is busy right now. Please try again later.",
    action: "retry",
    severity: "warning",
  },
  "aborted": {
    code: "CONFLICT",
    message:
      "That action conflicted with another update. Please try again.",
    action: "retry",
    severity: "warning",
  },
  "storage/object-too-large": {
    code: "FILE_TOO_LARGE",
    message:
      "That file is too large. Choose an image under 5 MB.",
    action: "correct",
    severity: "error",
  },
  "storage/unauthorized": {
    code: "UPLOAD_UNAUTHORIZED",
    message:
      "We couldn't upload that file. Please try again.",
    action: "retry",
    severity: "error",
  },
  "storage/canceled": {
    code: "UPLOAD_CANCELLED",
    message: "Upload cancelled.",
    action: "retry",
    severity: "info",
  },
  "storage/quota-exceeded": {
    code: "STORAGE_LIMIT",
    message:
      "Zwey can't accept more uploads right now. Please try again later.",
    action: "retry",
    severity: "warning",
  },
  "storage/retry-limit-exceeded": {
    code: "UPLOAD_TIMEOUT",
    message:
      "The upload took too long. Please try again.",
    action: "retry",
    severity: "warning",
  },
};

const DEFAULT_ERROR = {
  code: "UNKNOWN_ERROR",
  message: "Something went wrong. Please try again.",
  action: "retry",
  severity: "error",
};

const PASSWORD_RESET_ERROR = {
  code: "PASSWORD_RESET_REQUESTED",
  message:
    "If an account exists for that email, we'll send password reset instructions.",
  action: "dismiss",
  severity: "info",
};

export function toZweyError(error, context = "general") {
  const firebaseCode = error?.code || "";

  if (
    context === "password-reset" &&
    [
      "auth/user-not-found",
      "auth/invalid-email",
      "auth/invalid-credential",
    ].includes(firebaseCode)
  ) {
    return PASSWORD_RESET_ERROR;
  }

  return (
    ERROR_DEFINITIONS[firebaseCode] || {
      ...DEFAULT_ERROR,
      code:
        typeof firebaseCode === "string" && firebaseCode
          ? "INFRASTRUCTURE_ERROR"
          : DEFAULT_ERROR.code,
    }
  );
}

export function getZweyErrorMessage(error, context = "general") {
  return toZweyError(error, context).message;
}

export function logZweyError(context, error) {
  if (typeof console !== "undefined") {
    console.error(`[Zwey:${context}]`, error);
  }
      }
