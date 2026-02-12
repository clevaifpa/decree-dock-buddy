import { Clock } from "lucide-react";
import { StatusHistoryEntry } from "@/hooks/useContracts";
import { statusLabels } from "@/lib/mock-data";

interface Props {
  history: StatusHistoryEntry[];
}

const ContractTimeline = ({ history }: Props) => {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Chưa có lịch sử thay đổi</p>;
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
      {history.map((entry, i) => (
        <div key={entry.id} className="relative flex items-start gap-4 py-3">
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 shrink-0">
            <Clock className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {entry.old_status && (
                <>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {(statusLabels as any)[entry.old_status] || entry.old_status}
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                </>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {(statusLabels as any)[entry.new_status] || entry.new_status}
              </span>
            </div>
            {entry.note && <p className="text-sm text-foreground mt-1">{entry.note}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(entry.created_at).toLocaleString("vi-VN")}
              {entry.changed_by_name && ` · ${entry.changed_by_name}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContractTimeline;
