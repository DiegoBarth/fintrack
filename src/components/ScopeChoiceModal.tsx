import { BaseModal } from '@/components/ui/ModalBase';

interface ScopeChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: 'single' | 'future') => void;
  isDelete?: boolean;
}

export function ScopeChoiceModal({ isOpen, onClose, onConfirm, isDelete = false }: ScopeChoiceModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isDelete ? 'Excluir registro' : 'Alterar registro'}
      type="edit"
    >
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
        <p>
          Este registro faz parte de uma recorrência ou parcelamento.<br /><br />
          Deseja {isDelete ? 'excluir' : 'alterar'} apenas este registro ou este e todos os subsequentes?
        </p>
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 rounded-lg p-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all duration-200 active:scale-[0.98]"
            onClick={() => onConfirm('single')}
          >
            Somente este
          </button>
          <button
            className="flex-1 rounded-lg p-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 active:scale-[0.98]"
            onClick={() => onConfirm('future')}
          >
            Este e os próximos
          </button>
        </div>
      </div>
    </BaseModal>
  );
}