import { Priority, priorityLabels } from "@/lib/mock-data";

const priorityStyles: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-accent/15 text-accent",
  high: "bg-warning/15 text-warning",
  urgent: "bg-destructive/15 text-destructive",
};

const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyles[priority]}`}
  >
    {priorityLabels[priority]}
  </span>
);

export default PriorityBadge;
