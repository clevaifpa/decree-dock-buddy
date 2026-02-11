import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Clock, AlertTriangle, ArrowRight, FolderOpen,
  ExternalLink, Upload, FileCheck, X,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { useContracts, useObligations, useUpdateContract, useUploadContractFile } from "@/hooks/useContracts";
import { departments, obligationTypeLabels } from "@/lib/mock-data";

const contractCategories = [
  { key: "partner", label: "Hợp đồng đối tác", icon: "🤝" },
  { key: "office", label: "Hợp đồng văn phòng", icon: "🏢" },
  { key: "service", label: "Hợp đồng dịch vụ", icon: "⚙️" },
  { key: "hr", label: "Hợp đồng nhân sự", icon: "👥" },
  { key: "procurement", label: "Hợp đồng mua sắm", icon: "📦" },
];

const Dashboard = () => {
  const [showFolders, setShowFolders] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingContractId, setUploadingContractId] = useState<string | null>(null);

  const { data: contracts = [], isLoading: loadingContracts } = useContracts();
  const { data: obligations = [], isLoading: loadingObligations } = useObligations();
  const updateContract = useUpdateContract();
  const uploadFile = useUploadContractFile();

  const signedContracts = contracts.filter((c) => c.status === "signed" || c.status === "active");
  const pendingReviewContracts = contracts.filter((c) => c.status === "pending_review" || c.status === "in_review");
  const overdueObligations = obligations.filter((o) => o.status === "overdue");
  const upcomingObligations = obligations.filter((o) => o.status === "pending").slice(0, 5);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const filteredByCategory = selectedCategory
    ? signedContracts.filter((c) => c.category === selectedCategory)
    : signedContracts;

  const categoryLabel = selectedCategory
    ? contractCategories.find((cat) => cat.key === selectedCategory)?.label
    : null;

  const handleLiquidate = (contractId: string) => {
    updateContract.mutate({ id: contractId, status: "liquidated" });
  };

  const handleFileUpload = (contractId: string, isLiquidation: boolean) => {
    setUploadingContractId(contractId);
    if (fileInputRef.current) {
      fileInputRef.current.dataset.liquidation = isLiquidation ? "true" : "false";
      fileInputRef.current.click();
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingContractId) {
      const isLiquidation = e.target.dataset.liquidation === "true";
      uploadFile.mutate({ contractId: uploadingContractId, file, isLiquidation });
    }
    e.target.value = "";
  };

  if (loadingContracts || loadingObligations) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={onFileSelected} />
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Tổng quan</h1>
        <p className="text-sm text-muted-foreground mt-1">Theo dõi hợp đồng và nghĩa vụ pháp lý</p>
      </div>

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => setShowFolders(!showFolders)} className="text-left rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng hợp đồng</p>
              <p className="mt-1 text-3xl font-heading font-bold text-foreground">{contracts.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{signedContracts.length} đã ký · Nhấn để xem thư mục</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary"><FileText className="w-5 h-5" /></div>
          </div>
        </button>

        <Link to="/contracts" className="rounded-xl border border-warning/30 bg-warning/5 p-5 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Chờ review</p>
              <p className="mt-1 text-3xl font-heading font-bold text-warning">{pendingReviewContracts.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Yêu cầu từ các bộ phận</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/15 text-warning"><Clock className="w-5 h-5" /></div>
          </div>
        </Link>

        <Link to="/obligations" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Nghĩa vụ đến hạn</p>
              <p className="mt-1 text-3xl font-heading font-bold text-destructive">{overdueObligations.length + upcomingObligations.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{overdueObligations.length} quá hạn · {upcomingObligations.length} sắp tới</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/15 text-destructive"><AlertTriangle className="w-5 h-5" /></div>
          </div>
        </Link>
      </div>

      {/* Folder view */}
      {showFolders && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-foreground">{categoryLabel || "Thư mục hợp đồng"}</h2>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><X className="w-3 h-3" /> Quay lại</button>
            )}
          </div>
          {!selectedCategory ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {contractCategories.map((cat) => {
                const count = signedContracts.filter((c) => c.category === cat.key).length;
                return (
                  <button key={cat.key} onClick={() => setSelectedCategory(cat.key)} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center">
                    <FolderOpen className="w-8 h-8 text-primary" />
                    <span className="text-xs font-medium text-foreground">{cat.label}</span>
                    <span className="text-xs text-muted-foreground">{count} hợp đồng</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredByCategory.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Chưa có hợp đồng nào trong thư mục này</p>}
              {filteredByCategory.map((c) => {
                const contractObligations = obligations.filter((o) => o.contract_id === c.id && o.type === "payment");
                return (
                  <div key={c.id} className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.partner} · {(departments as any)[c.department] || c.department}</p>
                        {contractObligations.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {contractObligations.map((po) => (
                              <p key={po.id} className="text-xs text-warning flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Thanh toán: {po.due_date}{po.amount ? ` - ${formatCurrency(po.amount)}` : ""}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={c.status as any} />
                        <button onClick={() => handleLiquidate(c.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Thanh lý">
                          <FileCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleFileUpload(c.id, true)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Upload tài liệu thanh lý">
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
        {/* Pending review */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-foreground">Chờ review</h2>
            <Link to="/contracts" className="text-xs text-accent hover:underline flex items-center gap-1">Xem tất cả <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {pendingReviewContracts.map((c) => {
              const daysLeft = c.review_deadline ? daysUntil(c.review_deadline) : null;
              return (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.partner} · {(departments as any)[c.department] || c.department} · Yêu cầu bởi {c.requester}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {c.doc_link && (
                        <a href={c.doc_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Xem văn bản
                        </a>
                      )}
                      {daysLeft !== null && (
                        <span className={`text-xs font-medium ${daysLeft <= 2 ? "text-destructive" : daysLeft <= 4 ? "text-warning" : "text-muted-foreground"}`}>
                          Hạn review: {daysLeft <= 0 ? "Quá hạn" : `còn ${daysLeft} ngày`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <PriorityBadge priority={c.priority as any} />
                    <StatusBadge status={c.status as any} />
                  </div>
                </div>
              );
            })}
            {pendingReviewContracts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Không có hợp đồng nào chờ review</p>}
          </div>
        </div>

        {/* Upcoming obligations */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
