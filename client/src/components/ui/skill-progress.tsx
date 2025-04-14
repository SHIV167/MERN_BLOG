import { cn } from '@/lib/utils';

interface SkillProgressProps {
  name: string;
  percentage: number;
  colorClass?: string;
  className?: string;
}

export function SkillProgress({ 
  name, 
  percentage, 
  colorClass = 'bg-primary', 
  className 
}: SkillProgressProps) {
  return (
    <div className={cn('mb-4 last:mb-0', className)}>
      <div className="flex justify-between mb-1">
        <span className="text-gray-700 font-medium">{name}</span>
        <span className="text-gray-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={cn('h-2.5 rounded-full', colorClass)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
