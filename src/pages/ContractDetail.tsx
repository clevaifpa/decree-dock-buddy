import { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Upload, Download, Trash2, ExternalLink,
  FileCheck, Clock, Edit,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import ContractTimeline from "@/components/ContractTimeline";
import {
  useContract, useContractFiles, useContractObligations,
  useContractStatusHistory, useUpdateContract, useUploadContractFile,
  useDeleteContractFile, useDeleteContract, useDeleteObligation,
  useCreateObligation, useUpdateObligation, useContractCategories,
} from "@/hooks/useContracts";
import { useIsAdmin } from "@/hooks/useUserRole";
import { departments, statusLabels, ContractStatus, obligationTypeLabels } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

const allStatuses: ContractStatus[] = ["draft", "pending_review", "in_review", "approved", "rejected", "signed", "active", "expired", "liquidated"];

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: contract, isLoading } = useContract(id);
  const { data: files = [] } = useContractFiles(id);
  const { data: obligations = [] } = useContractObligations(id);
  const { data: history = [] } = useContractStatusHistory(id);
  const { data: categories = [] } = useContractCategories();
  const updateContract = useUpdateContract();
  const uploadFile = useUploadContractFile();
  const deleteFile = useDeleteContractFile();
  const deleteContract = useDeleteContract();
  const deleteObligation = useDeleteObligation();
  const createObligation = useCreateObligation();
  const updateObligation = useUpdateObligation();

  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  const [isLiquidation, setIsLiquidation] = useState(false);
  const [showAddObl, setShowAddObl] = useState(false);
  const [oblForm, setOblForm] = useState({ type: "payment", description: "", due_date: "", amount: "" });

  if (isLoading || !contract) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const handleFileUpload = (liquidation: boolean) => {
    setIsLiquidation(liquidation);
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id) {
      uploadFile.mutate({ contractId: id, file, isLiquidation });
    }
    e.target.value = "";
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage.from("contract-files").download(filePath);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "contract") {
      deleteContract.mutate(deleteTarget.id, { onSuccess: () => navigate("/contracts") });
    } else if (deleteTarget.type === "file") {
      const file = files.find((f) => f.id === deleteTarget.id);
      if (file) deleteFile.mutate({ id: file.id, filePath: file.file_path });
    } else if (deleteTarget.type === "obligation") {
      deleteObligation.mutate(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const handleAddObligation = () => {
    if (!oblForm.description || !oblForm.due_date || !id) return;
    createObligation.mutate({
      contract_id: id,
      type: oblForm.type,
      description: oblForm.description,
      due_date: oblForm.due_date,
      amount: oblForm.amount ? parseInt(oblForm.amount) : null,
    } as any, {
      onSuccess: () => { setOblForm({ type: "payment", description: "", due_date: "", amount: "" }); setShowAddObl(false); },
    });
  };

  const categoryName = categories.find((c) => c.id === contract.category_id)?.name;
  const inputClass = "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-4xl space-y-6">
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={onFileSelected} />

      <div className="flex items-center justify-between">
        <Link to="/contracts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Link>
        {isAdmin && (
          <button onClick={() => setDeleteTarget({ type: "contract", id: contract.id, name: contract.title })}
            className="inline-flex items-center gap-1.5 text-sm text-destructive hover:underline">
            <Trash2 className="w-4 h-4" /> Xóa hợp đồng
          </button>
        )}
      </div>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">{contract.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{contract.partner} · {(departments as any)[contract.department] || contract.department}</p>
            {categoryName && <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{categoryName}</span>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge priority={contract.priority as any} />
            <StatusBadge status={contract.status as any} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
          <div><p className="text-xs text-muted-foreground">Người yêu cầu</p><p className="text-sm font-medium text-foreground mt-0.5">{contract.requester}</p></div>
          <div><p className="text-xs text-muted-foreground">Giá trị</p><p className="text-sm font-medium text-foreground mt-0.5">{contract.value ? formatCurrency(contract.value) : "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Ngày hiệu lực</p><p className="text-sm font-medium text-foreground mt-0.5">{contract.start_date ? new Date(contract.start_date).toLocaleDateString("vi-VN") : "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Ngày hết hạn</p><p className="text-sm font-medium text-foreground mt-0.5">{contract.end_date ? new Date(contract.end_date).toLocaleDateString("vi-VN") : "—"}</p></div>
        </div>

        {contract.description && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Mô tả</p>
            <p className="text-sm text-foreground">{contract.description}</p>
          </div>
        )}

        {contract.doc_link && (
          <a href={contract.doc_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
            <ExternalLink className="w-3.5 h-3.5" /> Xem văn bản gốc
          </a>
        )}

        {/* Status change (admin) */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Cập nhật trạng thái</p>
            <div className="flex flex-wrap gap-2">
              {allStatuses.filter((s) => s !== contract.status).map((s) => (
                <button key={s} onClick={() => updateContract.mutate({ id: contract.id, status: s })}
                  className="px-3 py-1.5 rounded-md border border-input bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors">
                  {(statusLabels as any)[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Files */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Tài liệu ({files.length})
          </h2>
          <div className="flex gap-2">
            <button onClick={() => handleFileUpload(false)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">
              <Upload className="w-3 h-3" /> Upload
            </button>
            {(contract.status === "signed" || contract.status === "active" || contract.status === "expired" || contract.status === "liquidated") && (
              <button onClick={() => handleFileUpload(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input text-xs font-medium hover:bg-muted">
                <FileCheck className="w-3 h-3" /> Biên bản thanh lý
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{f.file_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString("vi-VN")} {f.is_liquidation && "· Biên bản thanh lý"}</p>
              </div>
              <div className="flex gap-1 ml-2">
                <button onClick={() => handleDownload(f.file_path, f.file_name)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                  <Download className="w-4 h-4" />
                </button>
                {isAdmin && (
                  <button onClick={() => setDeleteTarget({ type: "file", id: f.id, name: f.file_name })}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {files.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Chưa có tài liệu nào</p>}
        </div>
      </div>

      {/* Obligations */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" /> Nghĩa vụ ({obligations.length})
          </h2>
          <button onClick={() => setShowAddObl(!showAddObl)} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Edit className="w-3 h-3" /> Thêm nghĩa vụ
          </button>
        </div>
        {showAddObl && (
          <div className="p-4 mb-4 rounded-lg bg-muted/50 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select value={oblForm.type} onChange={(e) => setOblForm({ ...oblForm, type: e.target.value })} className={inputClass}>
                {Object.entries(obligationTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="date" value={oblForm.due_date} onChange={(e) => setOblForm({ ...oblForm, due_date: e.target.value })} className={inputClass} />
            </div>
            <input value={oblForm.description} onChange={(e) => setOblForm({ ...oblForm, description: e.target.value })} placeholder="Mô tả nghĩa vụ..." className={inputClass} />
            <div className="flex gap-3">
              <input value={oblForm.amount} onChange={(e) => setOblForm({ ...oblForm, amount: e.target.value })} placeholder="Số tiền (tùy chọn)" type="number" className={inputClass + " max-w-xs"} />
              <button onClick={handleAddObligation} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Thêm</button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {obligations.map((o) => {
            const days = Math.ceil((new Date(o.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isOverdue = o.status === "overdue";
            return (
              <div key={o.id} className={`flex items-center justify-between p-3 rounded-lg ${isOverdue ? "bg-destructive/5 border border-destructive/20" : "bg-muted/50"}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {(obligationTypeLabels as any)[o.type] || o.type}
                    </span>
                    <span className={`text-xs ${isOverdue ? "text-destructive" : days <= 7 ? "text-warning" : "text-muted-foreground"}`}>
                      {isOverdue ? `Trễ ${Math.abs(days)} ngày` : o.status === "completed" ? "Hoàn thành" : `Còn ${days} ngày`}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{o.description}</p>
                  {o.amount && <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(o.amount)}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  {o.status !== "completed" && (
                    <button onClick={() => updateObligation.mutate({ id: o.id, status: "completed" })}
                      className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90">Xong</button>
                  )}
                  {isAdmin && (
                    <button onClick={() => setDeleteTarget({ type: "obligation", id: o.id, name: o.description })}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {obligations.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Chưa có nghĩa vụ nào</p>}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Lịch sử trạng thái
        </h2>
        <ContractTimeline history={history} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        confirmLabel="Xóa"
      />
    </div>
  );
};

export default ContractDetail;
