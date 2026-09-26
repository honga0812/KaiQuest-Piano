import React from 'react';

export type AnimalType = 'eli_lion' | 'sanjuro' | 'gaga_duck' | 'guanguan_bunny' | 'kai';

interface AnimalMentorProps {
  type: AnimalType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnimalMentor: React.FC<AnimalMentorProps> = ({ type, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  switch (type) {
    case 'eli_lion':
      return (
        <div className={`${sizeMap[size]} ${className} relative shrink-0`} title="艾力獅 (Eli Lion)">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            {/* Mane */}
            <circle cx="50" cy="50" r="44" fill="#F59E0B" />
            <circle cx="50" cy="50" r="34" fill="#FDE68A" />
            {/* Ears */}
            <circle cx="24" cy="24" r="10" fill="#D97706" />
            <circle cx="76" cy="24" r="10" fill="#D97706" />
            {/* Eyes */}
            <circle cx="38" cy="46" r="4" fill="#1E293B" />
            <circle cx="62" cy="46" r="4" fill="#1E293B" />
            {/* Nose & whiskers */}
            <polygon points="50,54 44,60 56,60" fill="#B45309" />
            <path d="M 44,66 Q 50,72 56,66" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
            {/* Paws */}
            <ellipse cx="28" cy="80" rx="10" ry="7" fill="#F59E0B" />
            <ellipse cx="72" cy="80" rx="10" ry="7" fill="#F59E0B" />
          </svg>
        </div>
      );

    case 'sanjuro':
      return (
        <div className={`${sizeMap[size]} ${className} relative shrink-0`} title="三十郎大師 (Master Sanjuro)">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            {/* Owl head / feathers */}
            <ellipse cx="50" cy="52" rx="38" ry="36" fill="#6366F1" />
            {/* Owl ear tufts */}
            <polygon points="26,30 20,12 40,24" fill="#4F46E5" />
            <polygon points="74,30 80,12 60,24" fill="#4F46E5" />
            {/* Big glasses */}
            <circle cx="38" cy="48" r="14" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="3" />
            <circle cx="62" cy="48" r="14" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="3" />
            <line x1="52" y1="48" x2="48" y2="48" stroke="#FBBF24" strokeWidth="3" />
            {/* Pupils */}
            <circle cx="39" cy="48" r="5" fill="#1E293B" />
            <circle cx="61" cy="48" r="5" fill="#1E293B" />
            {/* Beak */}
            <polygon points="50,56 46,65 54,65" fill="#F59E0B" />
          </svg>
        </div>
      );

    case 'gaga_duck':
      return (
        <div className={`${sizeMap[size]} ${className} relative shrink-0`} title="嘎嘎嘎水鴨 (Ga-Ga Duck)">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            {/* Duck head */}
            <circle cx="50" cy="48" r="36" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
            {/* Sailor Hat */}
            <path d="M 30,22 L 70,22 L 65,12 L 35,12 Z" fill="#0284C7" />
            <rect x="25" y="22" width="50" height="5" rx="2" fill="#0369A1" />
            {/* Cheerful eye */}
            <circle cx="42" cy="42" r="4.5" fill="#0F172A" />
            <circle cx="64" cy="42" r="4.5" fill="#0F172A" />
            <circle cx="40" cy="40" r="1.5" fill="#FFFFFF" />
            <circle cx="62" cy="40" r="1.5" fill="#FFFFFF" />
            {/* Orange Beak */}
            <ellipse cx="53" cy="56" rx="16" ry="9" fill="#FB923C" />
          </svg>
        </div>
      );

    case 'guanguan_bunny':
      return (
        <div className={`${sizeMap[size]} ${className} relative shrink-0`} title="冠冠小兔 (Guanguan Bunny)">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            {/* Long rabbit ears */}
            <ellipse cx="36" cy="24" rx="8" ry="22" fill="#FDA4AF" />
            <ellipse cx="36" cy="24" rx="4" ry="16" fill="#FFF1F2" />
            <ellipse cx="64" cy="24" rx="8" ry="22" fill="#FDA4AF" />
            <ellipse cx="64" cy="24" rx="4" ry="16" fill="#FFF1F2" />
            {/* Face */}
            <circle cx="50" cy="58" r="32" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
            {/* Eyes */}
            <ellipse cx="40" cy="54" rx="3.5" ry="5" fill="#881337" />
            <ellipse cx="60" cy="54" rx="3.5" ry="5" fill="#881337" />
            {/* Cute pink nose */}
            <polygon points="50,62 46,67 54,67" fill="#F43F5E" />
            <path d="M 46,71 Q 50,75 54,71" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'kai':
    default:
      return (
        <div className={`${sizeMap[size]} ${className} relative shrink-0`} title="Kai">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <ellipse cx="50" cy="52" rx="36" ry="32" fill="#FB923C" />
            <polygon points="20,40 12,12 40,26" fill="#FB923C" />
            <polygon points="80,40 88,12 60,26" fill="#FB923C" />
            <circle cx="38" cy="48" r="5" fill="#0F172A" />
            <circle cx="62" cy="48" r="5" fill="#0F172A" />
            <polygon points="50,56 46,62 54,62" fill="#0F172A" />
            <path d="M 44,66 Q 50,72 56,66" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 26,72 Q 50,85 74,72 L 70,82 Q 50,92 30,82 Z" fill="#EF4444" />
          </svg>
        </div>
      );
  }
};
