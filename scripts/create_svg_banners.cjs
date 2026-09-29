const fs = require('fs');
const path = require('path');

const banner1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#001a33"/>
      <stop offset="40%" stop-color="#00274d"/>
      <stop offset="80%" stop-color="#023e7d"/>
      <stop offset="100%" stop-color="#001830"/>
    </linearGradient>
    <pattern id="cadastralGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.18"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1400" height="600" fill="url(#bgGrad1)"/>
  
  <!-- Tricolor Accent Bands on Top -->
  <rect x="0" y="0" width="1400" height="5" fill="#FF9933"/>
  <rect x="0" y="5" width="1400" height="4" fill="#FFFFFF" opacity="0.9"/>
  <rect x="0" y="9" width="1400" height="5" fill="#138808"/>

  <!-- Perspective 3D Cadastral Grid Plane -->
  <g transform="translate(550, 180) skewX(-24) rotate(-4)" opacity="0.85">
    <rect x="0" y="0" width="750" height="380" fill="url(#cadastralGrid)" stroke="#0284c7" stroke-width="1.5" stroke-opacity="0.4"/>
    
    <!-- Parcel Polygons (Punjab Cadastre Divisions) -->
    <polygon points="40,40 180,40 200,160 60,180" fill="#0284c7" fill-opacity="0.22" stroke="#38bdf8" stroke-width="2"/>
    <polygon points="180,40 340,50 360,170 200,160" fill="#10b981" fill-opacity="0.2" stroke="#34d399" stroke-width="2"/>
    <polygon points="340,50 520,40 540,160 360,170" fill="#f59e0b" fill-opacity="0.22" stroke="#fbbf24" stroke-width="2"/>
    <polygon points="60,180 200,160 220,320 80,330" fill="#6366f1" fill-opacity="0.2" stroke="#818cf8" stroke-width="2"/>
    <polygon points="200,160 360,170 380,310 220,320" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="2.5"/>
    <polygon points="360,170 540,160 560,300 380,310" fill="#10b981" fill-opacity="0.25" stroke="#34d399" stroke-width="2"/>
    
    <!-- Boundary Marker Pins -->
    <circle cx="200" cy="160" r="6" fill="#ffd700" stroke="#ffffff" stroke-width="2"/>
    <circle cx="360" cy="170" r="6" fill="#ffd700" stroke="#ffffff" stroke-width="2"/>
    <circle cx="380" cy="310" r="6" fill="#ffd700" stroke="#ffffff" stroke-width="2"/>
    <circle cx="220" cy="320" r="6" fill="#ffd700" stroke="#ffffff" stroke-width="2"/>
    
    <!-- 3D Extruded Building Footprint -->
    <path d="M240,200 L320,205 L330,270 L250,265 Z" fill="#0284c7" fill-opacity="0.6" stroke="#00f2fe" stroke-width="1.5"/>
    <path d="M240,200 L240,140 L320,145 L320,205 Z" fill="#38bdf8" fill-opacity="0.5" stroke="#00f2fe" stroke-width="1.5"/>
    <path d="M320,205 L320,145 L330,210 L330,270 Z" fill="#0369a1" fill-opacity="0.6" stroke="#00f2fe" stroke-width="1.5"/>
    <path d="M240,140 L320,145 L330,210 L250,205 Z" fill="#7dd3fc" fill-opacity="0.7" stroke="#ffffff" stroke-width="2"/>
  </g>

  <!-- Digital 14-Digit Bhu-Aadhaar Smart Card Graphic (Right) -->
  <g transform="translate(960, 90)">
    <rect width="360" height="220" rx="16" fill="#ffffff" stroke="#ffd700" stroke-width="2"/>
    <!-- Card Header -->
    <rect width="360" height="42" rx="16" fill="#00274d"/>
    <rect y="28" width="360" height="14" fill="#00274d"/>
    <text x="20" y="26" fill="#ffd700" font-family="Inter, sans-serif" font-size="12" font-weight="800" letter-spacing="1">BHU-AADHAAR &bull; 14-DIGIT ULPIN</text>
    <text x="340" y="26" fill="#ffffff" font-family="Inter, sans-serif" font-size="11" font-weight="600" text-anchor="end">DILRMP 2.0</text>
    
    <!-- Emblem inside Card -->
    <circle cx="42" cy="80" r="20" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
    <path d="M42 66 L52 74 L52 92 L32 92 L32 74 Z" fill="none" stroke="#15803d" stroke-width="1.5"/>
    
    <!-- Card Info Text -->
    <text x="74" y="72" fill="#64748b" font-family="Inter, sans-serif" font-size="9" font-weight="700">PARCEL IDENTIFIER (ULPIN)</text>
    <text x="74" y="88" fill="#0f172a" font-family="monospace" font-size="15" font-weight="800" letter-spacing="1.5">PB020011014121</text>
    
    <text x="20" y="125" fill="#64748b" font-family="Inter, sans-serif" font-size="9" font-weight="600">OWNER</text>
    <text x="20" y="140" fill="#0f172a" font-family="Inter, sans-serif" font-size="12" font-weight="700">Harpreet Singh</text>
    
    <text x="160" y="125" fill="#64748b" font-family="Inter, sans-serif" font-size="9" font-weight="600">DISTRICT / DIVISION</text>
    <text x="160" y="140" fill="#0f172a" font-family="Inter, sans-serif" font-size="12" font-weight="700">Amritsar-I, Punjab</text>
    
    <text x="20" y="175" fill="#64748b" font-family="Inter, sans-serif" font-size="9" font-weight="600">3D STRATA (FLOORS)</text>
    <text x="20" y="190" fill="#0284c7" font-family="Inter, sans-serif" font-size="11" font-weight="700">G+1 Declared &bull; ISO 19152</text>
    
    <text x="160" y="175" fill="#64748b" font-family="Inter, sans-serif" font-size="9" font-weight="600">STATUS</text>
    <text x="160" y="190" fill="#16a34a" font-family="Inter, sans-serif" font-size="11" font-weight="700">Digitally Certified</text>

    <!-- QR Code Mock -->
    <rect x="285" y="125" width="55" height="55" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
    <rect x="292" y="132" width="12" height="12" fill="#0f172a"/>
    <rect x="321" y="132" width="12" height="12" fill="#0f172a"/>
    <rect x="292" y="161" width="12" height="12" fill="#0f172a"/>
    <circle cx="315" cy="155" r="4" fill="#0284c7"/>
  </g>

  <!-- Ambient Light Orbs -->
  <circle cx="200" cy="200" r="260" fill="#0284c7" opacity="0.15"/>
  <circle cx="1200" cy="350" r="200" fill="#10b981" opacity="0.12"/>
</svg>`;

const banner2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#051329"/>
      <stop offset="40%" stop-color="#0a2540"/>
      <stop offset="80%" stop-color="#0e3a66"/>
      <stop offset="100%" stop-color="#041224"/>
    </linearGradient>
    <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#4facfe" stop-opacity="0.05"/>
    </linearGradient>
    <pattern id="slamGrid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#38bdf8" stroke-width="0.6" stroke-opacity="0.2"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1400" height="600" fill="url(#bgGrad2)"/>
  
  <!-- Tricolor Accent Top -->
  <rect x="0" y="0" width="1400" height="5" fill="#FF9933"/>
  <rect x="0" y="5" width="1400" height="4" fill="#FFFFFF" opacity="0.9"/>
  <rect x="0" y="9" width="1400" height="5" fill="#138808"/>

  <!-- 3D City Wireframe / Digital Twin Grid (Right) -->
  <g transform="translate(600, 200) skewX(-20)" opacity="0.9">
    <rect x="0" y="0" width="700" height="360" fill="url(#slamGrid)" stroke="#00f2fe" stroke-width="1" stroke-opacity="0.3"/>
    
    <!-- Building 1: G+1 Compliant -->
    <path d="M100,120 L180,120 L190,190 L110,190 Z" fill="#0284c7" fill-opacity="0.4" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M100,120 L100,60 L180,60 L180,120 Z" fill="#0ea5e9" fill-opacity="0.35" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M180,120 L180,60 L190,130 L190,190 Z" fill="#0369a1" fill-opacity="0.45" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M100,60 L180,60 L190,130 L110,130 Z" fill="#38bdf8" fill-opacity="0.6" stroke="#ffffff" stroke-width="2"/>

    <!-- Building 2: Height Anomaly (Level 3 Flagged) -->
    <path d="M240,160 L340,165 L350,250 L250,245 Z" fill="#1e293b" fill-opacity="0.5" stroke="#64748b" stroke-width="1.5"/>
    <path d="M240,160 L240,70 L340,75 L340,165 Z" fill="#0f172a" fill-opacity="0.5" stroke="#64748b" stroke-width="1.5"/>
    <path d="M340,165 L340,75 L350,160 L350,250 Z" fill="#0f172a" fill-opacity="0.6" stroke="#64748b" stroke-width="1.5"/>
    <!-- Level 3 Red Flagged Extension -->
    <path d="M240,70 L240,10 L340,15 L340,75 Z" fill="#dc2626" fill-opacity="0.5" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3"/>
    <path d="M340,75 L340,15 L350,100 L350,160 Z" fill="#991b1b" fill-opacity="0.6" stroke="#ef4444" stroke-width="2"/>
    <path d="M240,10 L340,15 L350,100 L250,95 Z" fill="#f87171" fill-opacity="0.6" stroke="#ffffff" stroke-width="2"/>

    <!-- Building 3 -->
    <path d="M400,100 L490,100 L500,180 L410,180 Z" fill="#0284c7" fill-opacity="0.35" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M400,100 L400,40 L490,40 L490,100 Z" fill="#0ea5e9" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M490,100 L490,40 L500,120 L500,180 Z" fill="#0369a1" fill-opacity="0.4" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M400,40 L490,40 L500,120 L410,120 Z" fill="#38bdf8" fill-opacity="0.5" stroke="#ffffff" stroke-width="2"/>
  </g>

  <!-- Autonomous Survey Drone Graphic with LiDAR Conical Scanning Beam -->
  <g transform="translate(880, 60)">
    <!-- LiDAR Conical Laser Beam -->
    <polygon points="60,40 -120,380 240,380" fill="url(#beamGrad)"/>
    
    <!-- Concentric Laser Rings on Ground -->
    <ellipse cx="60" cy="380" rx="160" ry="35" fill="none" stroke="#00f2fe" stroke-width="2" opacity="0.8" stroke-dasharray="6,4"/>
    <ellipse cx="60" cy="380" rx="90" ry="20" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.9"/>
    <circle cx="60" cy="380" r="4" fill="#ffd700"/>

    <!-- Drone Body (Hexacopter) -->
    <ellipse cx="60" cy="30" rx="24" ry="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <circle cx="60" cy="28" r="7" fill="#0284c7"/>
    
    <!-- Drone Arms and Rotors -->
    <line x1="36" y1="30" x2="-10" y2="16" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
    <line x1="84" y1="30" x2="130" y2="16" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
    <line x1="60" y1="20" x2="60" y2="2" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
    
    <ellipse cx="-10" cy="16" rx="26" ry="3" fill="#38bdf8" opacity="0.6"/>
    <ellipse cx="130" cy="16" rx="26" ry="3" fill="#38bdf8" opacity="0.6"/>
    <ellipse cx="60" cy="2" rx="26" ry="3" fill="#38bdf8" opacity="0.6"/>

    <!-- LiDAR Pod / Camera Gimbal -->
    <rect x="54" y="38" width="12" height="8" fill="#0f172a" rx="2"/>
    <circle cx="60" cy="42" r="3" fill="#00f2fe"/>
    
    <!-- Status Indicator LED -->
    <circle cx="60" cy="18" r="3" fill="#22c55e"/>
    
    <!-- Telemetry HUD Callout -->
    <g transform="translate(110, -10)">
      <rect width="150" height="52" rx="6" fill="rgba(0, 39, 77, 0.85)" stroke="#00f2fe" stroke-width="1"/>
      <text x="10" y="18" fill="#38bdf8" font-family="Inter, sans-serif" font-size="9" font-weight="700">AUTONOMOUS UAV</text>
      <text x="10" y="32" fill="#ffffff" font-family="monospace" font-size="10" font-weight="600">ALT: 45.2m &bull; RTK FIXED</text>
      <text x="10" y="45" fill="#22c55e" font-family="Inter, sans-serif" font-size="9" font-weight="700">PRECISION: &le;2.5cm</text>
    </g>
  </g>

  <!-- Ambient Glow -->
  <circle cx="250" cy="180" r="240" fill="#00f2fe" opacity="0.1"/>
</svg>`;

const bannersDir = path.join('assets', 'banners');
if (!fs.existsSync(bannersDir)) fs.mkdirSync(bannersDir, { recursive: true });

fs.writeFileSync(path.join(bannersDir, 'dilrmp-bhu-aadhaar-hero.svg'), banner1Svg, 'utf8');
fs.writeFileSync(path.join(bannersDir, 'drone-lidar-slam-hero.svg'), banner2Svg, 'utf8');
console.log('Saved SVG banners successfully!');
