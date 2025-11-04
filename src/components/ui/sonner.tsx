import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      visibleToasts={9}
      position="top-right"
      closeButton
      richColors
      expand
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pr-12",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:mt-1",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:leading-tight",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80",
          closeButton: "group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border hover:group-[.toast]:bg-muted group-[.toast]:absolute group-[.toast]:right-2 group-[.toast]:top-2 group-[.toast]:rounded-md group-[.toast]:p-1 group-[.toast]:opacity-70 group-[.toast]:transition-opacity hover:group-[.toast]:opacity-100",
        },
        style: {
          background: 'var(--background)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          padding: '16px',
          paddingRight: '48px',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
