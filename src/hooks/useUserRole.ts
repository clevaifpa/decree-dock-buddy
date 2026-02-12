import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserRole = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      // Ensure role exists
      await supabase.rpc("ensure_user_role");
      const { data, error } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user!.id)
        .single();
      if (error) return "user";
      return (data as any).role as string;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useIsAdmin = () => {
  const { data: role } = useUserRole();
  return role === "admin";
};
