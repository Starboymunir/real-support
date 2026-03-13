import { Icon } from '@iconify/react';
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
}) => {
  return (
    <>
      <div
        className={`container  fixed inset-0 flex justify-center items-center z-40 ${isOpen ? '' : 'hidden'}`}
      >
        <div
          className="bg-background opacity-50 absolute inset-0"
          onClick={onClose}
        />
        <div
          className={`container transform rounded-lg bg-hero-section bg-cover bg-center p-4 shadow-lg transition-transform duration-300 ease-in-out ${className}`}
        >
          <button
            onClick={onClose}
            className="absolute top-2 left-2 hover:text-gray-800"
          >
            {isOpen ? <Icon icon="ion:close" fontSize={36} /> : 'Open'}
          </button>
          <div className="max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Modal;
