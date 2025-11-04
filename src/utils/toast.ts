import { toast as sonnerToast } from "sonner";
import { toast as radixToast } from "@/hooks/use-toast";

// Funções do Sonner (mantidas para compatibilidade)
export const showSuccess = (message: string) => {
  sonnerToast.success(message);
};

export const showError = (message: string) => {
  sonnerToast.error(message);
};

export const showLoading = (message: string) => {
  return sonnerToast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
  sonnerToast.dismiss(toastId);
};

// Toast com título e descrição
export const showSuccessWithDescription = (title: string, description: string) => {
  sonnerToast.success(title, { description });
};

export const showErrorWithDescription = (title: string, description: string) => {
  sonnerToast.error(title, { description });
};

export const showInfoWithDescription = (title: string, description: string) => {
  sonnerToast.info(title, { description });
};

export const showWarningWithDescription = (title: string, description: string) => {
  sonnerToast.warning(title, { description });
};

export const showLoadingWithDescription = (title: string, description: string) => {
  return sonnerToast.loading(title, { description });
};

// Toast customizado com mais opções
export const showCustomToast = (
  title: string,
  description?: string,
  options?: {
    type?: 'success' | 'error' | 'info' | 'warning' | 'loading';
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
    cancel?: {
      label: string;
      onClick?: () => void;
    };
  }
) => {
  const { type = 'info', duration, action, cancel } = options || {};
  
  const toastOptions: {
    description?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
    cancel?: {
      label: string;
      onClick: () => void;
    };
  } = {
    description,
    duration,
  };

  if (action) {
    toastOptions.action = {
      label: action.label,
      onClick: action.onClick,
    };
  }

  if (cancel) {
    toastOptions.cancel = {
      label: cancel.label,
      onClick: cancel.onClick,
    };
  }

  switch (type) {
    case 'success':
      return sonnerToast.success(title, toastOptions);
    case 'error':
      return sonnerToast.error(title, toastOptions);
    case 'warning':
      return sonnerToast.warning(title, toastOptions);
    case 'loading':
      return sonnerToast.loading(title, toastOptions);
    default:
      return sonnerToast.info(title, toastOptions);
  }
};

// Novas funções usando Radix UI Toast com fundo branco
export const showRadixSuccess = (title: string, description?: string) => {
  radixToast({
    title,
    description,
    variant: "success",
  });
};

export const showRadixError = (title: string, description?: string) => {
  radixToast({
    title,
    description,
    variant: "destructive",
  });
};

export const showRadixInfo = (title: string, description?: string) => {
  radixToast({
    title,
    description,
    variant: "info",
  });
};

export const showRadixWarning = (title: string, description?: string) => {
  radixToast({
    title,
    description,
    variant: "warning",
  });
};

export const showRadixDefault = (title: string, description?: string) => {
  radixToast({
    title,
    description,
    variant: "default",
  });
};

export const showRadixToast = (
  title: string,
  description?: string,
  options?: {
    variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
    duration?: number;
    action?: React.ReactElement;
  }
) => {
  const { variant = 'default', duration = 5000, action } = options || {};
  
  radixToast({
    title,
    description,
    variant,
    duration,
    action,
  });
};
