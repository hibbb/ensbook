// src/components/ActionModals.tsx

import { ProcessModal, type ProcessType } from "./ProcessModal";
import { ReminderModal } from "./ReminderModal";
import type { NameRecord } from "../types/ensNames";
import { type Address } from "viem"; // 🚀

interface ActionModalsProps {
  modalState: {
    isOpen: boolean;
    type: string;
    status: string;
    txHash?: string | null;
    secondsLeft: number;
    title: string;
    currentExpiry?: number;
    reminderTarget: NameRecord | null;
    itemCount: number;
    expiryTimes: number[];
  };
  actions: {
    onCloseModal: () => void;
    onConfirmDuration: (durations: bigint[], owner?: Address) => void;
    setReminderTarget: (record: NameRecord | null) => void;
    onAbort: () => void;
    onConfirmRegistration: () => void;
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
        itemCount={modalState.itemCount}
        expiryTimes={modalState.expiryTimes}
        onAbort={actions.onAbort}
        onConfirmRegistration={actions.onConfirmRegistration}
      />

      <ReminderModal
        isOpen={!!modalState.reminderTarget}
        onClose={() => actions.setReminderTarget(null)}
        record={modalState.reminderTarget}
      />
    </>
  );
};
