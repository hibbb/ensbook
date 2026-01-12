// src/components/ActionModals.tsx

import { ProcessModal, type ProcessType } from "./ProcessModal";
import { ReminderModal } from "./ReminderModal";
import type { NameRecord } from "../types/ensNames";

interface ActionModalsProps {
  modalState: {
    isOpen: boolean;
    type: string; // ProcessType 的字符串形式
    status: string;
    txHash?: string | null;
    secondsLeft: number;
    title: string;
    currentExpiry?: number;
    reminderTarget: NameRecord | null;
  };
  actions: {
    onCloseModal: () => void;
    onConfirmDuration: (duration: bigint) => void;
    setReminderTarget: (record: NameRecord | null) => void;
  };
}

export const ActionModals = ({ modalState, actions }: ActionModalsProps) => {
  return (
    <>
      <ProcessModal
        isOpen={modalState.isOpen}
        type={modalState.type as ProcessType}
        status={modalState.status}
        txHash={modalState.txHash}
        secondsLeft={modalState.secondsLeft}
        title={modalState.title}
        currentExpiry={modalState.currentExpiry}
        onClose={actions.onCloseModal}
        onConfirm={actions.onConfirmDuration}
      />

      <ReminderModal
        isOpen={!!modalState.reminderTarget}
        onClose={() => actions.setReminderTarget(null)}
        record={modalState.reminderTarget}
      />
    </>
  );
};
