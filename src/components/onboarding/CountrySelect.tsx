import { useState, useMemo } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const countries = [
  "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaiyán", "Bahamas", "Bahrein", "Bangladesh", "Barbados", "Bélgica", "Belice",
  "Benín", "Bielorrusia", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi",
  "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá",
  "Chad", "Chile", "China", "Chipre", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur",
  "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto",
  "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos",
  "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia",
  "Ghana", "Granada", "Grecia", "Guatemala", "Guinea", "Guinea Ecuatorial", "Guinea-Bisáu", "Guyana",
  "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Islandia",
  "Israel", "Italia", "Jamaica", "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati",
  "Kuwait", "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania",
  "Luxemburgo", "Macedonia del Norte", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta",
  "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia",
  "Montenegro", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria",
  "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos", "Panamá", "Papúa Nueva Guinea",
  "Paraguay", "Perú", "Polonia", "Portugal", "Qatar", "Reino Unido", "República Centroafricana",
  "República Checa", "República del Congo", "República Democrática del Congo", "República Dominicana",
  "Ruanda", "Rumania", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas",
  "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur",
  "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza",
  "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago",
  "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu",
  "Vaticano", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"
];

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CountrySelect = ({ value, onChange }: CountrySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    return countries.filter((country) =>
      country.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 bg-background text-left transition-all text-base",
          isOpen ? "border-primary" : "border-border hover:border-muted-foreground/50",
          value ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span>{value || "Selecciona tu nacionalidad"}</span>
        <ChevronDown className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => { setIsOpen(false); setSearch(""); }}
          />
          <div className="absolute z-20 w-full mt-2 bg-background rounded-xl border-2 border-border shadow-float overflow-hidden">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar país..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-secondary/50 focus:border-primary focus:outline-none text-sm"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No se encontraron resultados
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-secondary",
                      value === country && "bg-secondary"
                    )}
                  >
                    <span>{country}</span>
                    {value === country && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
