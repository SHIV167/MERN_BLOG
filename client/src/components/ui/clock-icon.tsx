import { cn } from '@/lib/utils';

interface ClockIconProps {
  className?: string;
  hourDegree?: number;
  minuteDegree?: number;
  secondDegree?: number;
}

export function ClockIcon({ 
  className,
  hourDegree = 45,
  minuteDegree = 280,
  secondDegree = 190
}: ClockIconProps) {
  // Generate array of 12 clock markings
  const markings = Array.from({ length: 12 }, (_, i) => i + 1);
  
  return (
    <div className={cn('relative w-64 h-64 mx-auto', className)}>
      <div className="w-full h-full rounded-full border-4 border-primary-light relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full relative">
            {/* Clock face */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full bg-white flex items-center justify-center">
                {/* Clock markings */}
                {markings.map((hour) => (
                  <div 
                    key={hour}
                    className="absolute w-1 h-4 bg-gray-300" 
                    style={{ transform: `rotate(calc(30deg * ${hour})) translateY(-24px)` }}
                  />
                ))}
                
                {/* Clock hands */}
                <div 
                  className="absolute w-1 h-16 bg-primary-dark rounded-full origin-bottom" 
                  style={{ transform: `rotate(${hourDegree}deg)` }}
                />
                <div 
                  className="absolute w-1 h-20 bg-primary rounded-full origin-bottom" 
                  style={{ transform: `rotate(${minuteDegree}deg)` }}
                />
                <div 
                  className="absolute w-0.5 h-24 bg-secondary rounded-full origin-bottom" 
                  style={{ transform: `rotate(${secondDegree}deg)` }}
                />
                
                {/* Clock center */}
                <div className="absolute w-4 h-4 bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
