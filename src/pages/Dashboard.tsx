import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  AlertTriangle,
  ArrowRight,
  FolderOpen,
  ExternalLink,
  Upload,
  FileCheck,
  ChevronRight,
  X,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import {
  mockContracts,
  mockObligations,
  departments,
  obligationTypeLabels,
} from "@/lib/mock-data";

// Contract categories for folder view
const contractCategories = [
  { key: "partner", label: "Hợp đồng đối tác", icon: "🤝" },
  { key: "office", label: "Hợp đồng văn phòng", icon: "🏢" },
  { key: "service", label: "Hợp đồng dịch vụ", icon: "⚙️" },
  { key: "hr", label: "Hợp đồng nhân sự", icon: "👥" },
  { key: "procurement", label: "Hợp đồng mua sắm", icon: "📦" },
];

// Map contracts to categories (mock logic)
const getCategoryForContract = (contract: typeof mockContracts[0]) => {
  if (contract.department === "hr") return "hr";
  if (contract.department === "operations") return "office";
  if (contract.department === "finance") return "procurement";
  if (contract.department === "marketing" || contract.department === "sales") return "partner";
  return "service";
};

const Dashboard = () => {
  const [showFolders, setShowFolders] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const signedContracts = mockContracts.filter(
    (c) => c.status === "signed" || c.status === "active"
  );
  const pendingReviewContracts = mockContracts.filter(
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

  const filteredByCategory = selectedCategory
    ? signedContracts.filter((c) => getCategoryForContract(c) === selectedCategory)
    : signedContracts;

  const categoryLabel = selectedCategory
    ? contractCategories.find((cat) => cat.key === selectedCategory)?.label
    : null;

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

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tổng hợp đồng */}
        <button
          onClick={() => setShowFolders(!showFolders)}
          className="text-left rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng hợp đồng</p>
              <p className="mt-1 text-3xl font-heading font-bold text-foreground">
                {mockContracts.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {signedContracts.length} đã ký · Nhấn để xem thư mục
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Chờ review */}
        <Link
          to="/contracts"
          className="rounded-xl border border-warning/30 bg-warning/5 p-5 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Chờ review</p>
              <p className="mt-1 text-3xl font-heading font-bold text-warning">
                {pendingReviewContracts.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Yêu cầu từ các bộ phận
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/15 text-warning">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Nghĩa vụ đến hạn */}
        <Link
          to="/obligations"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Nghĩa vụ đến hạn</p>
              <p className="mt-1 text-3xl font-heading font-bold text-destructive">
                {overdueObligations.length + upcomingObligations.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {overdueObligations.length} quá hạn · {upcomingObligations.length} sắp tới
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/15 text-destructive">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>

      {/* Folder view for contracts */}
      {showFolders && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-foreground">
              {categoryLabel || "Thư mục hợp đồng"}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Quay lại
              </button>
            )}
          </div>

          {!selectedCategory ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {contractCategories.map((cat) => {
                const count = signedContracts.filter(
                  (c) => getCategoryForContract(c) === cat.key
                ).length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center group"
                  >
                    <FolderOpen className="w-8 h-8 text-primary" />
                    <span className="text-xs font-medium text-foreground">{cat.label}</span>
                    <span className="text-xs text-muted-foreground">{count} hợp đồng</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredByCategory.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có hợp đồng nào trong thư mục này
                </p>
              )}
              {filteredByCategory.map((c) => {
                const obligations = mockObligations.filter((o) => o.contractId === c.id);
                const paymentObs = obligations.filter((o) => o.type === "payment");
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.partner} · {departments[c.department]}
                        </p>
                        {/* Extracted obligations info */}
                        {paymentObs.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {paymentObs.map((po) => (
                              <p key={po.id} className="text-xs text-warning flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Thanh toán: {po.dueDate}
                                {po.amount && ` - ${formatCurrency(po.amount)}`}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={c.status} />
                        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Thanh lý">
                          <FileCheck className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Upload tài liệu thanh lý">
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending review contracts with deadlines */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-foreground">
              Chờ review
            </h2>
            <Link
              to="/contracts"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingReviewContracts.map((c) => {
              // Mock review deadline: 5 days from updatedAt
              const reviewDeadline = new Date(c.updatedAt);
              reviewDeadline.setDate(reviewDeadline.getDate() + 5);
              const daysLeft = daysUntil(reviewDeadline.toISOString().split("T")[0]);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.partner} · {departments[c.department]} · Yêu cầu bởi {c.requester}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <a
                        href="#"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                        onClick={(e) => e.preventDefault()}
                      >
                        <ExternalLink className="w-3 h-3" /> Xem văn bản
                      </a>
                      <span className={`text-xs font-medium ${daysLeft <= 2 ? "text-destructive" : daysLeft <= 4 ? "text-warning" : "text-muted-foreground"}`}>
                        Hạn review: {daysLeft <= 0 ? "Quá hạn" : `còn ${daysLeft} ngày`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              );
            })}
            {pendingReviewContracts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Không có hợp đồng nào chờ review
              </p>
            )}
          </div>
        </div>

        {/* Upcoming obligations */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-foreground">
              Nghĩa vụ đến hạn
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
