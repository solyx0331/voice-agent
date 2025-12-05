import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api/api";
import { Contact } from "@/lib/api/types";

export function useContacts(search?: string, status?: string) {
  return useQuery<Contact[]>({
    queryKey: ["contacts", search, status],
    queryFn: () => apiService.getContacts(search, status),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contact: Omit<Contact, "id">) => apiService.createContact(contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

