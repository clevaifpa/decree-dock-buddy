import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, ArrowLeft, Upload, X } from "lucide-react";
import { departments, Department, Priority, priorityLabels } from "@/lib/mock-data";
import { useCreateContract, useContractCategories, useUploadContractFile } from "@/hooks/useContracts";
import { useAuth } from "@/hooks/useAuth";

const NewContractRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createContract = useCreateContract();
  const { data: categories = [] } = useContractCategories();
  const uploadFile = useUploadContractFile();
  const docFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", partner: "", department: "" as Department | "", priority: "medium" as Priority,
    value: "", description: "", startDate: "", endDate: "", requester: "", docLink: "",
    reviewDeadline: "", categoryId: "",
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.partner || !form.department || !form.requester) return;

    createContract.mutate({
      title: form.title,
      partner: form.partner,
      department: form.department,
      requester: form.requester,
      requester_user_id: user?.id || null,
      priority: form.priority,
      value: form.value ? parseInt(form.value.replace(/[^\d]/g, "")) : null,
      description: form.description || null,
      doc_link: form.docLink || null,
      review_deadline: form.reviewDeadline || null,
      start_date: form.startDate || null,
      end_date: form.endDate || null,
      category_id: form.categoryId || null,
      status: "pending_review",
    } as any, {
      onSuccess: (data: any) => {
        const contractId = data?.id;
        if (contractId) {
          if (docFile) uploadFile.mutate({ contractId, file: docFile });
          if (pdfFile) uploadFile.mutate({ contractId, file: pdfFile });
        }
        navigate("/contracts");
      },
    });
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link to="/contracts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="w-4 h-4" /> Quay lại</Link>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2"><FileText className="w-6 h-6 text-primary" /> Upload / Tạo yêu cầu hợp đồng</h1>
        <p className="text-sm text-muted-foreground mt-1">Điền thông tin và upload tài liệu hợp đồng</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tên hợp đồng <span className="text-destructive">*</span></label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Hợp đồng cung cấp dịch vụ..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Đối tác <span className="text-destructive">*</span></label>
              <input type="text" value={form.partner} onChange={(e) => setForm({ ...form, partner: e.target.value })} placeholder="Tên công ty đối tác" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Người yêu cầu <span className="text-destructive">*</span></label>
              <input type="text" value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })} placeholder="Họ tên" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Bộ phận <span className="text-destructive">*</span></label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value as Department })} className={inputClass}>
                <option value="">Chọn bộ phận</option>
                {Object.entries(departments).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phân loại hợp đồng</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass}>
                <option value="">Chọn loại hợp đồng</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Mức ưu tiên</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className={inputClass}>
                {Object.entries(priorityLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Giá trị hợp đồng</label>
            <input type="text" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="VD: 500000000" className={inputClass} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Thời hạn & tài liệu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ngày hiệu lực</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ngày hết hạn</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Link văn bản (Google Docs)</label>
              <input type="url" value={form.docLink} onChange={(e) => setForm({ ...form, docLink: e.target.value })} placeholder="https://docs.google.com/..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Hạn review</label>
              <input type="date" value={form.reviewDeadline} onChange={(e) => setForm({ ...form, reviewDeadline: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mô tả chi tiết</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Mô tả nội dung hợp đồng..." className={inputClass + " resize-none"} />
          </div>
        </div>

        {/* File uploads */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Upload tài liệu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">File .doc (bản soạn thảo)</label>
              <input type="file" ref={docFileRef} className="hidden" accept=".doc,.docx" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
              {docFile ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="truncate flex-1">{docFile.name}</span>
                  <button type="button" onClick={() => { setDocFile(null); if (docFileRef.current) docFileRef.current.value = ""; }} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => docFileRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-input hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Upload className="w-4 h-4" /> Chọn file .doc
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">File PDF (đã ký & scan)</label>
              <input type="file" ref={pdfFileRef} className="hidden" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              {pdfFile ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="truncate flex-1">{pdfFile.name}</span>
                  <button type="button" onClick={() => { setPdfFile(null); if (pdfFileRef.current) pdfFileRef.current.value = ""; }} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => pdfFileRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-input hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Upload className="w-4 h-4" /> Chọn file PDF
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={createContract.isPending} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {createContract.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
          <Link to="/contracts" className="px-6 py-2.5 rounded-lg border border-input bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors">Hủy</Link>
        </div>
      </form>
    </div>
  );
};

export default NewContractRequest;
