import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Plus, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useContracts, useDeleteContract, useContractCategories } from "@/hooks/useContracts";
import { useIsAdmin } from "@/hooks/useUserRole";
import { departments, statusLabels, ContractStatus } from "@/lib/mock-data";

const ContractList = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { data: contracts = [], isLoading } = useContracts();
  const { data: categories = [] } = useContractCategories();
  const deleteContract = useDeleteContract();
  const isAdmin = useIsAdmin();
  const [deleteId, setDeleteId] = useState<{ id: string; name: string } | null>(null);

  const filtered = contracts.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.partner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchCategory = categoryFilter === "all" || c.category_id === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
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
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer">
          <option value="all">Tất cả danh mục</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Hợp đồng</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Đối tác</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Danh mục</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Giá trị</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ưu tiên</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Hết hạn</th>
                {isAdmin && <th className="text-left px-4 py-3 font-medium text-muted-foreground w-10"></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const cat = categories.find((cat) => cat.id === c.category_id);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/contracts/${c.id}`} className="hover:text-primary">
                        <p className="font-medium text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Yêu cầu bởi {c.requester}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground">{c.partner}</td>
                    <td className="px-4 py-3 text-foreground text-xs">{cat ? `${cat.icon} ${cat.name}` : "—"}</td>
                    <td className="px-4 py-3 text-foreground">{c.value ? formatCurrency(c.value) : "—"}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={c.priority as any} /></td>
                    <td className="px-4 py-3"><StatusBadge status={c.status as any} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.end_date ? new Date(c.end_date).toLocaleDateString("vi-VN") : "—"}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteId({ id: c.id, name: c.title })} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={isAdmin ? 8 : 7} className="px-4 py-8 text-center text-muted-foreground">Không tìm thấy hợp đồng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Xóa hợp đồng"
        description={`Bạn có chắc chắn muốn xóa "${deleteId?.name}"? Tất cả tài liệu và nghĩa vụ liên quan sẽ bị xóa.`}
        onConfirm={() => { if (deleteId) deleteContract.mutate(deleteId.id); setDeleteId(null); }}
      />
    </div>
  );
};

export default ContractList;
