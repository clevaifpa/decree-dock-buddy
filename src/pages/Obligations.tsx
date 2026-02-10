import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Filter } from "lucide-react";
import {
  mockObligations,
  obligationTypeLabels,
  ObligationType,
} from "@/lib/mock-data";

const Obligations = () => {
  const [typeFilter, setTypeFilter] = useState<ObligationType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = mockObligations.filter((o) => {
    const matchType = typeFilter === "all" || o.type === typeFilter;
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchType && matchStatus;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const daysUntil = (date: string) =>
    Math.ceil(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

  const statusIcon = (status: string) => {
    switch (status) {
      case "overdue":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "overdue":
        return "Quá hạn";
      case "completed":
        return "Hoàn thành";
      default:
        return "Chờ xử lý";
    }
  };

  const selectClass =
    "pl-9 pr-8 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Nghĩa vụ hợp đồng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi các nghĩa vụ và deadline từ hợp đồng
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-xl font-heading font-bold text-destructive">
              {mockObligations.filter((o) => o.status === "overdue").length}
            </p>
            <p className="text-xs text-muted-foreground">Quá hạn</p>
          </div>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-warning" />
          <div>
            <p className="text-xl font-heading font-bold text-warning">
              {mockObligations.filter((o) => o.status === "pending").length}
            </p>
            <p className="text-xs text-muted-foreground">Chờ xử lý</p>
          </div>
        </div>
        <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div>
            <p className="text-xl font-heading font-bold text-success">
              {mockObligations.filter((o) => o.status === "completed").length}
            </p>
            <p className="text-xs text-muted-foreground">Hoàn thành</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ObligationType | "all")}
            className={selectClass}
          >
            <option value="all">Tất cả loại</option>
            {Object.entries(obligationTypeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="overdue">Quá hạn</option>
            <option value="pending">Chờ xử lý</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Obligations list */}
      <div className="space-y-3">
        {sorted.map((o) => {
          const days = daysUntil(o.dueDate);
          const isOverdue = o.status === "overdue";
          return (
            <div
              key={o.id}
              className={`rounded-xl border p-4 transition-colors ${
                isOverdue
                  ? "border-destructive/20 bg-destructive/5"
                  : "border-border bg-card hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">{statusIcon(o.status)}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {o.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {o.contractTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {obligationTypeLabels[o.type]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {statusLabel(o.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Hạn: {o.dueDate}</p>
                  <p
                    className={`text-sm font-semibold mt-0.5 ${
                      isOverdue
                        ? "text-destructive"
                        : days <= 7
                        ? "text-warning"
                        : "text-foreground"
                    }`}
                  >
                    {isOverdue
                      ? `Trễ ${Math.abs(days)} ngày`
                      : o.status === "completed"
                      ? "Đã xong"
                      : `Còn ${days} ngày`}
                  </p>
                  {o.amount && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(o.amount)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Không tìm thấy nghĩa vụ nào
          </div>
        )}
      </div>
    </div>
  );
};

export default Obligations;
