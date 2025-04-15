import { cn } from '@/lib/utils';

interface ClockIconProps {
  className?: string;
  text?: string;
}

export function ClockIcon({ 
  className,
  text = "Shiv Jha | Web Designer and Developer |"
}: ClockIconProps) {
  return (
    <div className={cn('relative w-full aspect-square max-w-[500px] mx-auto', className)}>
      <style>{`
        .button-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 80%;
          height: 80%;
          z-index: 999999;
        }
        
        .circular-text {
          width: 100%;
          height: 100%;
          animation: rotate 20s linear infinite;
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .circle-background {
          fill: none;
          stroke: rgb(103 55 192);
          stroke-width: 65;
        }
        
        .download-arrow {
          position: absolute;
          width: 32px;
          height: 32px;
          stroke: rgb(103 55 192);
          stroke-width: 9;
        }
        
        .button-container:hover {
          cursor: pointer;
        }
        
        .button-container:hover .circle-background {
          stroke: rgba(0, 0, 0, 0.6);
        }
      `}</style>

      <div className="button-container">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          xmlLang="en" 
          xmlnsXlink="http://www.w3.org/1999/xlink" 
          viewBox="0 0 500 500" 
          className="circular-text"
        >
          <defs>
            <path 
              id="textcircle" 
              d="M250,400 a150,150 0 0,1 0,-300 a150,150 0 0,1 0,300Z" 
              transform="rotate(12,250,250)"
            />
          </defs>
          <path 
            className="circle-background" 
            d="M250 35 A 1 1 0 1 1 250 465 A 1 1 0 1 1 250 35"
          />
          <g>
            <text textLength="940" style={{ fontSize: '24px', fontWeight: 'bold', fill: 'black' }}>
              <textPath xlinkHref="#textcircle" aria-label="Profile Text" textLength="940">
                {text}&nbsp;
              </textPath>
            </text>
          </g>
        </svg>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          className="download-arrow"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
          />
        </svg>
      </div>
    </div>
  );
}
