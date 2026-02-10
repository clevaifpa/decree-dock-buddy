import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import {
  mockContracts,
  mockObligations,
  departments,
  obligationTypeLabels,
} from "@/lib/mock-data";

const Dashboard = () => {
  const pendingContracts = mockContracts.filter(
    (c) => c.status === "pending_review" || c.status === "in_review"
  );
  const overdueObligations = mockObligations.filter(
    (o) => o.status === "overdue"
  );
  const upcomingObligations = mockObligations
    .filter((o) => o.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const daysUntil = (date: string) => {
    const diff = Math.ceil(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Tổng quan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi hợp đồng và nghĩa vụ pháp lý
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng hợp đồng"
          value={mockContracts.length}
          icon={FileText}
          subtitle="Trong hệ thống"
        />
        <StatCard
          title="Chờ review"
          value={pendingContracts.length}
          icon={Clock}
          subtitle="Cần xử lý"
          variant="warning"
        />
        <StatCard
          title="Quá hạn"
          value={overdueObligations.length}
          icon={AlertTriangle}
          subtitle="Nghĩa vụ trễ hạn"
          variant="danger"
        />
        <StatCard
          title="Đã hoàn thành"
          value={mockObligations.filter((o) => o.status === "completed").length}
          icon={CheckCircle2}
          subtitle="Nghĩa vụ trong tháng"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending contracts */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-foreground">
              Hợp đồng chờ xử lý
            </h2>
            <Link
              to="/contracts"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingContracts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {c.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.partner} · {departments[c.department]}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
            {pendingContracts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Không có hợp đồng nào chờ xử lý
              </p>
            )}
          </div>
        </div>

        {/* Upcoming obligations */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-foreground">
              Nghĩa vụ sắp tới
            </h2>
            <Link
              to="/obligations"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {[...overdueObligations, ...upcomingObligations].map((o) => {
              const days = daysUntil(o.dueDate);
              const isOverdue = o.status === "overdue";
              return (
                <div
                  key={o.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isOverdue
                      ? "bg-destructive/5 border border-destructive/20"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {obligationTypeLabels[o.type]}
                      </span>
                      {isOverdue && (
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground mt-1 truncate">
                      {o.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {o.contractTitle}
                    </p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        isOverdue
                          ? "text-destructive"
                          : days <= 7
                          ? "text-warning"
                          : "text-foreground"
                      }`}
                    >
                      {isOverdue
                        ? `Trễ ${Math.abs(days)} ngày`
                        : `${days} ngày`}
                    </p>
                    {o.amount && (
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(o.amount)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
