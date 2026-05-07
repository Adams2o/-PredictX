import { toast as sonnerToast, ExternalToast } from "sonner";

const defaultOptions: ExternalToast = {
  duration: 4000,
  closeButton: true,
  style: {
    background: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    color: 'hsl(var(--foreground))',
  },
};

export const success = (message: string, options?: ExternalToast) => {
  return sonnerToast.success(message, {
    ...defaultOptions,
    duration: 4000,
    style: {
      background: 'hsl(var(--background))',
      border: '1px solid hsl(var(--accent) / 0.3)',
      color: 'hsl(var(--accent))',
      ...options?.style,
    },
    ...options,
  });
};

export const error = (message: string, options?: ExternalToast) => {
  return sonnerToast.error(message, {
    ...defaultOptions,
    duration: 6000,
    style: {
      background: 'hsl(var(--background))',
      border: '1px solid hsl(var(--destructive) / 0.5)',
      color: 'hsl(var(--destructive))',
      ...options?.style,
    },
    ...options,
  });
};

export const warning = (message: string, options?: ExternalToast) => {
  return sonnerToast.warning(message, {
    ...defaultOptions,
    duration: 5000,
    style: {
      background: 'hsl(var(--background))',
      border: '1px solid rgb(234 179 8 / 0.3)',
      color: 'rgb(250 204 21)',
      ...options?.style,
    },
    ...options,
  });
};

export const info = (message: string, options?: ExternalToast) => {
  return sonnerToast.info(message, {
    ...defaultOptions,
    duration: 3000,
    ...options,
  });
};

export const loading = (message: string, options?: ExternalToast) => {
  return sonnerToast.loading(message, {
    ...defaultOptions,
    duration: Infinity,
    ...options,
  });
};

// Fixed: removed unsupported third argument, merged options into second arg
export const promise = <T>(
  promiseFn: Promise<T>,
  messages: {
    loading: string;
    success: string | ((result: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ExternalToast
) => {
  return sonnerToast.promise(promiseFn, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...defaultOptions,
    ...options,
  });
};

export const configError = (
  message: string,
  description?: string,
  action?: { label: string; onClick: () => void }
) => {
  return sonnerToast.error(message, {
    description,
    duration: Infinity,
    closeButton: true,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
    style: {
      background: 'hsl(var(--background))',
      border: '1px solid hsl(var(--destructive) / 0.5)',
      color: 'hsl(var(--destructive))',
    },
  });
};

export const userRejected = (message: string) => {
  return sonnerToast.info(message, {
    duration: 2000,
    closeButton: false,
    style: {
      background: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      color: 'hsl(var(--muted-foreground))',
    },
  });
};

export { sonnerToast as toast };

export default {
  success,
  error,
  warning,
  info,
  loading,
  promise,
  configError,
  userRejected,
  toast: sonnerToast,
};