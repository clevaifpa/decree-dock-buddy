import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Contract {
  id: string;
  title: string;
  partner: string;
  department: string;
  requester: string;
  requester_user_id: string | null;
  status: string;
  priority: string;
  category: string | null;
  category_id: string | null;
  value: number | null;
  description: string | null;
  doc_link: string | null;
  review_deadline: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
}

export interface Obligation {
  id: string;
  contract_id: string;
  type: string;
  description: string;
  due_date: string;
  status: string;
  amount: number | null;
  created_at: string;
  contract?: Contract;
  contractTitle?: string;
}

export interface ContractFile {
  id: string;
  contract_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  uploaded_by: string | null;
  is_liquidation: boolean;
  created_at: string;
}

export interface StatusHistoryEntry {
  id: string;
  contract_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  changed_by_name: string | null;
  note: string | null;
  created_at: string;
}

// ─── Contracts ───
export const useContracts = () => {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Contract[];
    },
  });
};

export const useContract = (id?: string) => {
  return useQuery({
    queryKey: ["contract", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Contract;
    },
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contract: Partial<Contract>) => {
      const { data, error } = await supabase.from("contracts").insert(contract as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Tạo yêu cầu hợp đồng thành công!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Contract>) => {
      const { error } = await supabase.from("contracts").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      qc.invalidateQueries({ queryKey: ["contract"] });
      toast.success("Cập nhật hợp đồng thành công!");
    },
  });
};

export const useDeleteContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contracts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Đã xóa hợp đồng!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

// ─── Obligations ───
export const useObligations = () => {
  return useQuery({
    queryKey: ["obligations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obligations")
        .select("*, contracts(title)")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return (data as any[]).map((o) => ({
        ...o,
        contractTitle: o.contracts?.title || "",
      }));
    },
  });
};

export const useContractObligations = (contractId?: string) => {
  return useQuery({
    queryKey: ["obligations", contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obligations")
        .select("*")
        .eq("contract_id", contractId!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as Obligation[];
    },
    enabled: !!contractId,
  });
};

export const useCreateObligation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (obligation: Partial<Obligation>) => {
      const { error } = await supabase.from("obligations").insert(obligation as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obligations"] });
      toast.success("Thêm nghĩa vụ thành công!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateObligation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("obligations").update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obligations"] });
      toast.success("Cập nhật trạng thái thành công!");
    },
  });
};

export const useDeleteObligation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("obligations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obligations"] });
      toast.success("Đã xóa nghĩa vụ!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

// ─── Contract Files ───
export const useContractFiles = (contractId?: string) => {
  return useQuery({
    queryKey: ["contract-files", contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_files")
        .select("*")
        .eq("contract_id", contractId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContractFile[];
    },
    enabled: !!contractId,
  });
};

export const useUploadContractFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractId, file, isLiquidation = false }: { contractId: string; file: File; isLiquidation?: boolean }) => {
      const filePath = `${contractId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("contract-files")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: user } = await supabase.auth.getUser();
      const { error: dbError } = await supabase.from("contract_files").insert({
        contract_id: contractId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        uploaded_by: user.user?.id,
        is_liquidation: isLiquidation,
      } as any);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contract-files"] });
      toast.success("Upload file thành công!");
    },
    onError: (e: Error) => toast.error("Lỗi upload: " + e.message),
  });
};

export const useDeleteContractFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      await supabase.storage.from("contract-files").remove([filePath]);
      const { error } = await supabase.from("contract_files").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contract-files"] });
      toast.success("Đã xóa file!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

// ─── Categories ───
export const useContractCategories = () => {
  return useQuery({
    queryKey: ["contract-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_categories" as any)
        .select("*")
        .order("name");
      if (error) throw error;
      return data as unknown as ContractCategory[];
    },
  });
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, slug, icon }: { name: string; slug: string; icon: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("contract_categories" as any).insert({
        name, slug, icon, created_by: user.user?.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contract-categories"] });
      toast.success("Tạo danh mục thành công!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contract_categories" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contract-categories"] });
      toast.success("Đã xóa danh mục!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

// ─── Status History ───
export const useContractStatusHistory = (contractId?: string) => {
  return useQuery({
    queryKey: ["contract-status-history", contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_status_history" as any)
        .select("*")
        .eq("contract_id", contractId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as StatusHistoryEntry[];
    },
    enabled: !!contractId,
  });
};
