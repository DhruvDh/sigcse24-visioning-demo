import { FC } from 'react';
import { clsx } from 'clsx';
import { H4 } from './Typography';
import { MotionDiv } from './Motion';

interface ErrorDialogProps {
  error: string | null;
  onClose: () => void;
}

export const ErrorDialog: FC<ErrorDialogProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={clsx(
          "bg-white rounded-lg shadow-xl",
          "p-6 max-w-md w-full mx-4",
          "border border-red-200"
        )}
      >
        <H4 className="text-red-600 mb-4">Error</H4>
        <p className="text-gray-700 mb-6">{error}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={clsx(
              "px-4 py-2 rounded",
              "bg-red-600 text-white",
              "hover:bg-red-700",
              "transition-colors duration-200"
            )}
          >
            Close
          </button>
        </div>
      </MotionDiv>
    </div>
  );
}; 