interface CountryFlagProps {
  code: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Usar tamaños exactos disponibles en flagcdn.com
const sizeMap = {
  sm: { width: 20, height: 15, cdnWidth: 40 },
  md: { width: 32, height: 24, cdnWidth: 80 },
  lg: { width: 80, height: 60, cdnWidth: 160 },
};

export const CountryFlag = ({ code, size = "md", className = "" }: CountryFlagProps) => {
  const { width, height, cdnWidth } = sizeMap[size];
  const flagUrl = `https://flagcdn.com/w${cdnWidth}/${code.toLowerCase()}.png`;

  return (
    <img
      src={flagUrl}
      alt={`Bandera de ${code.toUpperCase()}`}
      width={width}
      height={height}
      className={`inline-block object-cover rounded-sm border border-border/30 shadow-sm ${className}`}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};
