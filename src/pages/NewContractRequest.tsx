import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { departments, Department, Priority, priorityLabels } from "@/lib/mock-data";
import { toast } from "sonner";

const NewContractRequest = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    partner: "",
    department: "" as Department | "",
    priority: "medium" as Priority,
    value: "",
    description: "",
    startDate: "",
    endDate: "",
    requester: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.partner || !form.department || !form.requester) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    toast.success("Yêu cầu hợp đồng đã được gửi thành công!");
    navigate("/contracts");
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          to="/contracts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Tạo yêu cầu hợp đồng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Điền thông tin để gửi yêu cầu tới phòng pháp chế
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Thông tin cơ bản
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tên hợp đồng <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="VD: Hợp đồng cung cấp dịch vụ..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Đối tác <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.partner}
                onChange={(e) => setForm({ ...form, partner: e.target.value })}
                placeholder="Tên công ty đối tác"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Người yêu cầu <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.requester}
                onChange={(e) => setForm({ ...form, requester: e.target.value })}
                placeholder="Họ tên người yêu cầu"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Bộ phận <span className="text-destructive">*</span>
              </label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value as Department })
                }
                className={inputClass}
              >
                <option value="">Chọn bộ phận</option>
                {Object.entries(departments).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Mức ưu tiên
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as Priority })
                }
                className={inputClass}
              >
                {Object.entries(priorityLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Giá trị hợp đồng
              </label>
              <input
                type="text"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="VD: 500,000,000 VNĐ"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Thời hạn & mô tả
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mô tả chi tiết
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Mô tả nội dung hợp đồng, các điều khoản quan trọng cần lưu ý..."
              className={inputClass + " resize-none"}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Gửi yêu cầu
          </button>
          <Link
            to="/contracts"
            className="px-6 py-2.5 rounded-lg border border-input bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default NewContractRequest;
