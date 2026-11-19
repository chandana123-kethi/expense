import { useEffect, useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            <Trash2 size={15} /> {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={20} />
        </span>
        <p className="text-sm text-ink-600">{message}</p>
      </div>
    </Modal>
  );
}

export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; loading: boolean }>({
    open: false,
    loading: false,
  });

  const confirm = () => setState((s) => ({ ...s, open: true }));
  const close = () => setState((s) => ({ ...s, open: false, loading: false }));
  const setLoading = (loading: boolean) => setState((s) => ({ ...s, loading }));

  useEffect(() => {}, []);
  return { ...state, confirm, close, setLoading };
}
