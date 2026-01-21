interface CountryFlagProps {
  code: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { width: 20, height: 15 },
  md: { width: 32, height: 24 },
  lg: { width: 80, height: 60 },
};

export const CountryFlag = ({ code, size = "md", className = "" }: CountryFlagProps) => {
  const { width, height } = sizeMap[size];
  const flagUrl = `https://flagcdn.com/w${width * 2}/${code.toLowerCase()}.png`;

  return (
    <img
      src={flagUrl}
      alt={`${code.toUpperCase()} flag`}
      width={width}
      height={height}
      className={`inline-block object-cover rounded-sm ${className}`}
      loading="lazy"
    />
  );
};
