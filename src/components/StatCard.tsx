import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  variant?: "default" | "warning" | "danger";
}

const variantStyles = {
  default: "border-border",
  warning: "border-warning/30 bg-warning/5",
  danger: "border-destructive/30 bg-destructive/5",
};

const iconVariantStyles = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
};

const StatCard = ({ title, value, icon: Icon, subtitle, variant = "default" }: StatCardProps) => (
  <div className={`rounded-xl border p-5 glass-card ${variantStyles[variant]}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-heading font-bold text-foreground">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${iconVariantStyles[variant]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export default StatCard;
