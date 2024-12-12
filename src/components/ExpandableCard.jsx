// components/ExpandableCard.jsx
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { ChevronDown } from 'lucide-react'; // Import ChevronDown icon from lucide-react

export const ExpandableCard = ({ 
  title, 
  children, 
  className = "", 
  bgColor = "bg-white",
  onClick,
  isClickable = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`
        w-full 
        transition-all 
        duration-500 
        ease-in-out 
        ${isExpanded ? 'col-span-full row-span-2 scale-[1.02]' : 'scale-100'}
      `}
    >
      <Card 
        className={`
          ${className} 
          ${bgColor} 
          ${isClickable || 'cursor-pointer'} 
          transition-all 
          duration-300 
          hover:shadow-xl
          hover:scale-[1.01]
          relative
          overflow-hidden
          group
        `}
        onClick={() => {
          setIsExpanded(!isExpanded);
          onClick?.();
        }}
      >
        {/* Gradient overlay */}
        <div className={`
          absolute 
          inset-0 
          bg-gradient-to-r 
          from-transparent 
          via-white/5 
          to-transparent 
          translate-x-[-100%] 
          group-hover:translate-x-[100%] 
          transition-transform 
          duration-1000
        `} />

        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={`
            text-lg 
            font-medium 
            transition-all 
            duration-300
            ${isExpanded ? 'text-xl' : 'text-lg'}
          `}>
            {title}
          </CardTitle>
          <ChevronDown 
            className={`
              w-5 
              h-5 
              transition-transform 
              duration-300 
              ${isExpanded ? 'rotate-180' : 'rotate-0'}
              opacity-70
              group-hover:opacity-100
            `} 
          />
        </CardHeader>

        <CardContent>
          <div className={`
            transition-all 
            duration-500 
            ease-in-out
            overflow-hidden
            ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-[100px] opacity-90'}
          `}>
            {children}
          </div>
        </CardContent>

        {/* Expandable indicator */}
        {!isExpanded && (
          <div className="
            absolute 
            bottom-0 
            left-0 
            right-0 
            h-8 
            bg-gradient-to-t 
            from-black/10 
            to-transparent
            pointer-events-none
          "/>
        )}

        {/* Hover effect border */}
        <div className={`
          absolute 
          inset-0 
          border-2 
          border-transparent 
          group-hover:border-white/10 
          rounded-lg 
          transition-all 
          duration-300
          ${isExpanded ? 'border-white/20' : ''}
        `}/>
      </Card>
    </div>
  );
};