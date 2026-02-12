import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Clock, AlertTriangle, ArrowRight, CheckCircle2, Upload,
  CalendarClock, Plus, Trash2,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  useContracts, useObligations, useContractCategories,
  useCreateCategory, useDeleteCategory,
} from "@/hooks/useContracts";
import { useIsAdmin } from "@/hooks/useUserRole";
import { departments, obligationTypeLabels, statusLabels } from "@/lib/mock-data";

const Dashboard = () => {
  const { data: contracts = [], isLoading: lc } = useContracts();
  const { data: obligations = [], isLoading: lo } = useObligations();
  const { data: categories = [] } = useContractCategories();
  const isAdmin = useIsAdmin();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [filter, setFilter] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📄");
  const [showNewCat, setShowNewCat] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const stats = useMemo(() => {
    const total = contracts.length;
    const expiring = contracts.filter(
      (c) => c.end_date && ["signed", "active"].includes(c.status) &&
        new Date(c.end_date) <= in30Days && new Date(c.end_date) >= now
    ).length;
    const pendingReview = contracts.filter(
      (c) => c.status === "pending_review" || c.status === "in_review"
    ).length;
    const signed = contracts.filter(
      (c) => c.status === "signed" || c.status === "active"
    ).length;
    return { total, expiring, pendingReview, signed };
  }, [contracts]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach((cat) => {
      map[cat.id] = contracts.filter((c) => c.category_id === cat.id).length;
    });
    return map;
  }, [contracts, categories]);

  const filteredContracts = useMemo(() => {
    if (!filter) return [];
    switch (filter) {
      case "total": return contracts;
      case "expiring": return contracts.filter(
        (c) => c.end_date && ["signed", "active"].includes(c.status) &&
          new Date(c.end_date) <= in30Days && new Date(c.end_date) >= now
      );
      case "pending": return contracts.filter(
        (c) => c.status === "pending_review" || c.status === "in_review"
      );
      case "signed": return contracts.filter(
        (c) => c.status === "signed" || c.status === "active"
      );
      default: return contracts.filter((c) => c.category_id === filter);
    }
  }, [filter, contracts]);

  const overdueObligations = obligations.filter((o) => o.status === "overdue");
  const upcomingObligations = obligations.filter((o) => o.status === "pending").slice(0, 5);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const daysUntil = (date: string) =>
    Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    createCategory.mutate({ name: newCatName, slug, icon: newCatIcon }, {
      onSuccess: () => { setNewCatName(""); setNewCatIcon("📄"); setShowNewCat(false); },
    });
  };

  if (lc || lo) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const statCards = [
    { key: "total", label: "Tổng hợp đồng", value: stats.total, icon: FileText, variant: "default" as const, sub: "Nhấn để xem tất cả" },
    { key: "expiring", label: "Sắp hết hạn (30 ngày)", value: stats.expiring, icon: CalendarClock, variant: "warning" as const, sub: "Cần chú ý gia hạn" },
    { key: "pending", label: "Chờ review", value: stats.pendingReview, icon: Clock, variant: "warning" as const, sub: "Yêu cầu từ các bộ phận" },
    { key: "signed", label: "Đã ký / Hiệu lực", value: stats.signed, icon: CheckCircle2, variant: "default" as const, sub: "Đang hoạt động" },
  ];

  const variantStyles = {
    default: "border-border bg-card",
    warning: "border-warning/30 bg-warning/5",
    danger: "border-destructive/30 bg-destructive/5",
  };
  const iconStyles = {
    default: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Legal Management Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý hợp đồng & nghĩa vụ pháp lý tập trung</p>
        </div>
        <Link to="/contracts/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Upload className="w-4 h-4" /> Upload hợp đồng
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <button key={s.key} onClick={() => setFilter(filter === s.key ? null : s.key)}
            className={`text-left rounded-xl border p-5 hover:shadow-md transition-all ${filter === s.key ? "ring-2 ring-primary" : ""} ${variantStyles[s.variant]}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-heading font-bold text-foreground">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${iconStyles[s.variant]}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-heading font-semibold text-foreground">Phân loại hợp đồng</h2>
          {isAdmin && (
            <button onClick={() => setShowNewCat(!showNewCat)} className="text-xs text-primary hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Thêm danh mục
            </button>
          )}
        </div>
        {showNewCat && isAdmin && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/50">
            <input value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} className="w-12 text-center text-lg border border-input rounded-md py-1" maxLength={2} />
            <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Tên danh mục mới..." className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <button onClick={handleCreateCategory} disabled={createCategory.isPending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">Tạo</button>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setFilter(filter === cat.id ? null : cat.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-lg transition-colors text-center group ${filter === cat.id ? "bg-primary/10 ring-2 ring-primary" : "bg-muted/50 hover:bg-muted"}`}>
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-medium text-foreground">{cat.name}</span>
              <span className="text-lg font-heading font-bold text-foreground">{categoryCounts[cat.id] || 0}</span>
              {isAdmin && (
                <button onClick={(e) => { e.stopPropagation(); setDeleteCatId(cat.id); }}
                  className="absolute top-1 right-1 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filtered Contract List */}
      {filter && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-foreground">
              {filteredContracts.length} hợp đồng
            </h2>
            <button onClick={() => setFilter(null)} className="text-xs text-muted-foreground hover:text-foreground">✕ Đóng</button>
          </div>
          <div className="space-y-2">
            {filteredContracts.map((c) => (
              <Link key={c.id} to={`/contracts/${c.id}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.partner} · {(departments as any)[c.department] || c.department}</p>
                  {c.end_date && (
                    <p className="text-xs text-muted-foreground mt-0.5">Hết hạn: {new Date(c.end_date).toLocaleDateString("vi-VN")}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <PriorityBadge priority={c.priority as any} />
                  <StatusBadge status={c.status as any} />
                </div>
              </Link>
            ))}
            {filteredContracts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Không có hợp đồng nào</p>}
          </div>
        </div>
      )}

      {/* Two columns: Pending review + Obligations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-foreground">Chờ review</h2>
            <Link to="/contracts" className="text-xs text-accent hover:underline flex items-center gap-1">Xem tất cả <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {contracts.filter((c) => c.status === "pending_review" || c.status === "in_review").slice(0, 5).map((c) => {
              const daysLeft = c.review_deadline ? daysUntil(c.review_deadline) : null;
              return (
                <Link key={c.id} to={`/contracts/${c.id}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.partner} · {c.requester}</p>
                    {daysLeft !== null && (
                      <span className={`text-xs font-medium ${daysLeft <= 2 ? "text-destructive" : daysLeft <= 4 ? "text-warning" : "text-muted-foreground"}`}>
                        Hạn review: {daysLeft <= 0 ? "Quá hạn" : `còn ${daysLeft} ngày`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <PriorityBadge priority={c.priority as any} />
                    <StatusBadge status={c.status as any} />
                  </div>
                </Link>
              );
            })}
            {contracts.filter((c) => c.status === "pending_review" || c.status === "in_review").length === 0 &&
              <p className="text-sm text-muted-foreground text-center py-4">Không có hợp đồng nào chờ review</p>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-foreground">Nghĩa vụ đến hạn</h2>
            <Link to="/obligations" className="text-xs text-accent hover:underline flex items-center gap-1">Xem tất cả <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {[...overdueObligations, ...upcomingObligations].map((o) => {
              const days = daysUntil(o.due_date);
              const isOverdue = o.status === "overdue";
              return (
                <div key={o.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isOverdue ? "bg-destructive/5 border border-destructive/20" : "bg-muted/50 hover:bg-muted"}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {(obligationTypeLabels as any)[o.type] || o.type}
                      </span>
                      {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                    </div>
                    <p className="text-sm font-medium text-foreground mt-1 truncate">{o.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{o.contractTitle}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className={`text-sm font-semibold ${isOverdue ? "text-destructive" : days <= 7 ? "text-warning" : "text-foreground"}`}>
                      {isOverdue ? `Trễ ${Math.abs(days)} ngày` : `${days} ngày`}
                    </p>
                    {o.amount && <p className="text-xs text-muted-foreground">{formatCurrency(o.amount)}</p>}
                  </div>
                </div>
              );
            })}
            {overdueObligations.length + upcomingObligations.length === 0 &&
              <p className="text-sm text-muted-foreground text-center py-4">Không có nghĩa vụ nào</p>}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteCatId}
        onOpenChange={() => setDeleteCatId(null)}
        title="Xóa danh mục"
        description="Bạn có chắc chắn muốn xóa danh mục này? Các hợp đồng thuộc danh mục sẽ không bị ảnh hưởng."
        onConfirm={() => { if (deleteCatId) deleteCategory.mutate(deleteCatId); setDeleteCatId(null); }}
      />
    </div>
  );
};

export default Dashboard;
