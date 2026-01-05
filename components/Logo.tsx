
import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'light' | 'dark' | 'color'; // light = for dark backgrounds
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'color', className = '' }) => {
    // Sizes configuration
    const sizes = {
        sm: { now: '1.5rem', ella: '1.75rem', ml: '-3px', tr: '2px', icon: 32 },
        md: { now: '2rem', ella: '2.5rem', ml: '-4px', tr: '2px', icon: 42 },
        lg: { now: '2.5rem', ella: '3rem', ml: '-4px', tr: '2px', icon: 56 },
        xl: { now: '3.5rem', ella: '4rem', ml: '-6px', tr: '4px', icon: 72 }
    };
    const s = sizes[size];

    // Styles based on variant
    const getNowStyle = () => {
        if (variant === 'light') { // For dark backgrounds (White Crystal Gemstone)
            return {
                // Crystal/Diamond Gradient: Silver -> White -> Ice Blue Refraction -> White
                background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 30%, #a5f3fc 50%, #ffffff 70%, #e2e8f0 100%)',
                // Glow + Drop Shadow for depth
                shadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(165, 243, 252, 0.3)',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'
            };
        }
        // Default/Color (Sapphire Gemstone for light backgrounds)
        return {
            background: 'linear-gradient(135deg, #1e1b4b 0%, #3b82f6 50%, #1e3a8a 100%)',
            shadow: '0 1px 2px rgba(0,0,0,0.1)',
            filter: 'none'
        };
    };

    const getEllaStyle = () => {
        // Metallic Gold Gradient (Bronze -> Pale Gold -> Deep Gold -> Pale Gold -> Bronze)
        const metallicGold = 'linear-gradient(to bottom, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)';
        // Richer Gold for light backgrounds
        const deepGold = 'linear-gradient(to bottom, #b45309 0%, #f59e0b 50%, #78350f 100%)';

        if (variant === 'light') {
             return {
                background: metallicGold,
                shadow: '0 1px 0 rgba(0,0,0,0.3)', // Subtle bevel
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' // Heavy shadow to pop off velvet
             };
        }
        return {
            background: deepGold,
            shadow: '0 1px 1px rgba(0,0,0,0.1)',
            filter: 'none'
        };
    };

    const nowStyle = getNowStyle();
    const ellaStyle = getEllaStyle();

    // Definitions for gradients to be reused in SVG
    const defs = (
        <defs>
            <linearGradient id="crystalGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="30%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#a5f3fc" />
                <stop offset="70%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BF953F" />
                <stop offset="25%" stopColor="#FCF6BA" />
                <stop offset="50%" stopColor="#B38728" />
                <stop offset="75%" stopColor="#FBF5B7" />
                <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>
            {/* Sapphire for Light Mode */}
            <linearGradient id="sapphireGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            {/* Deep Gold for Light Mode */}
            <linearGradient id="deepGoldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
    );

    const quillFill = variant === 'light' ? 'url(#crystalGradient)' : 'url(#sapphireGradient)';
    const inkwellFill = variant === 'light' ? 'url(#goldGradient)' : 'url(#deepGoldGradient)';
    const strokeColor = variant === 'light' ? '#fff' : '#1e1b4b';

    return (
        <div className={`flex items-center select-none ${className}`}>
            <svg 
                width={s.icon} 
                height={s.icon} 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="mr-3 overflow-visible"
                style={{ filter: variant === 'light' ? 'drop-shadow(0 0 5px rgba(255,255,255,0.3))' : 'none' }}
            >
                {defs}
                
                {/* Quill Shaft - Angled */}
                <path 
                    d="M55 55 L 75 15" 
                    stroke={quillFill} 
                    strokeWidth="3" 
                    strokeLinecap="round"
                />
                
                {/* Feather Body - Crystal */}
                <path 
                    d="M75 15 C 85 25, 75 45, 55 55 C 50 45, 60 15, 75 15 Z" 
                    fill={quillFill}
                    stroke={strokeColor}
                    strokeWidth="0.5"
                    strokeOpacity="0.5"
                />
                {/* Feather Frills */}
                <path d="M75 15 C 78 18, 77 22, 74 25" stroke={strokeColor} strokeWidth="0.5" strokeOpacity="0.3" fill="none"/>
                <path d="M72 20 C 75 25, 73 30, 68 35" stroke={strokeColor} strokeWidth="0.5" strokeOpacity="0.3" fill="none"/>
                <path d="M68 28 C 70 35, 68 40, 62 45" stroke={strokeColor} strokeWidth="0.5" strokeOpacity="0.3" fill="none"/>

                {/* Inkwell - Gold */}
                {/* Bottle Shape */}
                <path 
                    d="M35 60 C 35 55, 65 55, 65 60 L 65 65 C 70 70, 75 75, 75 85 C 75 95, 25 95, 25 85 C 25 75, 30 70, 35 65 L 35 60 Z" 
                    fill={inkwellFill}
                    stroke={variant === 'light' ? '#FBF5B7' : '#d97706'}
                    strokeWidth="1"
                />
                
                {/* Inkwell Opening Rim */}
                <ellipse cx="50" cy="60" rx="15" ry="4" fill={variant === 'light' ? '#AA771C' : '#92400e'} stroke={strokeColor} strokeWidth="0.5" />
                
                {/* Ink surface inside */}
                <ellipse cx="50" cy="60" rx="12" ry="3" fill="#1e1b4b" opacity="0.8" />

                {/* Quill Tip (dipped in ink) */}
                <path d="M55 55 L 48 70" stroke={quillFill} strokeWidth="2" strokeLinecap="round" />

            </svg>

            <span style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 800,
                fontSize: s.now,
                lineHeight: 1,
                background: nowStyle.background,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: nowStyle.shadow,
                filter: nowStyle.filter
            }}>
                Now
            </span>
            <span style={{
                fontFamily: '"Great Vibes", cursive',
                fontSize: s.ella,
                lineHeight: 1,
                background: ellaStyle.background,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: ellaStyle.shadow,
                filter: ellaStyle.filter,
                transform: `translateY(${s.tr})`,
                marginLeft: s.ml
            }}>
                Ella
            </span>
        </div>
    );
};
