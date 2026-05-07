import { toast as sonnerToast } from 'sonner';

/** Pre-configured toast helpers matching RS Ride dark theme */
export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),

  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),

  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),

  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),

  /** Show a loading toast that can be resolved/rejected later */
  promise: <T,>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string },
  ) => sonnerToast.promise(promise, msgs),
};
