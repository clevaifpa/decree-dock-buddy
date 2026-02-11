import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Plus } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { useContracts } from "@/hooks/useContracts";
import { departments, statusLabels, ContractStatus } from "@/lib/mock-data";

const ContractList = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const { data: contracts = [], isLoading } = useContracts();

  const filtered = contracts.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.partner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Danh sách hợp đồng</h1>
          <p className="text-sm text-muted-foreground mt-1">{contracts.length} hợp đồng trong hệ thống</p>
        </div>
        <Link to="/contracts/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Tạo yêu cầu
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Tìm theo tên hợp đồng hoặc đối tác..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ContractStatus | "all")} className="pl-9 pr-8 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer">
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Hợp đồng</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Đối tác</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bộ phận</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Giá trị</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ưu tiên</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Yêu cầu bởi {c.requester}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">{c.partner}</td>
                  <td className="px-4 py-3 text-foreground">{(departments as any)[c.department] || c.department}</td>
                  <td className="px-4 py-3 text-foreground">{c.value ? formatCurrency(c.value) : "—"}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority as any} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status as any} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Không tìm thấy hợp đồng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractList;
