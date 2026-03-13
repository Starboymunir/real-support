import Image from 'next/image';
import React, { MouseEvent } from 'react';

interface SocialButtonProps {
  social: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  imgSrc: string;
  bgColor: string;
  disabled?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  social,
  onClick,
  imgSrc,
  bgColor,
  disabled = false,
}) => {
  return (
    <button
      className={`outline-none border-none ${bgColor} text-md font-poppins flex items-center p-2 rounded-md w-full`}
      onClick={onClick}
    >
      <div className="">
        <Image
          width={40}
          height={40}
          src={imgSrc}
          alt={social}
          className="object-contain"
        />
      </div>
      <span className="text-lg grow">{`Continue with ${social}`}</span>
    </button>
  );
};

export default SocialButton;
