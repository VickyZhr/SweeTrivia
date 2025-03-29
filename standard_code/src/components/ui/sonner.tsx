
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      duration={2000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        style: {
          fontSize: '2rem',
          padding: '2.5rem',
          maxWidth: '550px',
          width: '95%',
          marginBottom: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 25px rgba(0,0,0,0.25)',
          border: '3px solid #FF453A',
          background: 'linear-gradient(to right, #FFEBEE, #FFCDD2)',
          color: '#B71C1C'
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
