import { useCallback, useRef } from "react";
import { terminalToast } from "@/components/ui/sonner";
import { flashElement } from "@/lib/flashElement";

export function useMutationFeedback() {
  const flashRef = useRef<HTMLDivElement | null>(null);

  const onSave = useCallback((entityName: string) => {
    flashElement(flashRef.current, "data-incoming-flash", 700);
    terminalToast.success(`${entityName} saved successfully`);
  }, []);

  const onCreate = useCallback((entityName: string) => {
    flashElement(flashRef.current, "data-incoming-flash", 700);
    terminalToast.success(`${entityName} created`);
  }, []);

  const onDelete = useCallback((entityName: string) => {
    terminalToast.info(`${entityName} deleted`);
  }, []);

  const onError = useCallback((message: string) => {
    terminalToast.error(message);
  }, []);

  return { flashRef, onSave, onCreate, onDelete, onError };
}
