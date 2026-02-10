import { ContractStatus, statusLabels } from "@/lib/mock-data";

const statusStyles: Record<ContractStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-warning/15 text-warning",
  in_review: "bg-accent/15 text-accent",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  signed: "bg-primary/15 text-primary",
  active: "bg-success/15 text-success",
  expired: "bg-muted text-muted-foreground",
};

const StatusBadge = ({ status }: { status: ContractStatus }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
  >
    {statusLabels[status]}
  </span>
);

export default StatusBadge;
