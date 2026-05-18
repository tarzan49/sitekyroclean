import { ReactNode } from "react";

interface ServicePageTitleProps {
  children: ReactNode;
  className?: string;
}

/**
 * Service page title component that highlights keywords in gold
 * Use {{keyword}} syntax in translation files to highlight keywords
 * Example: "Limpeza de {{Sofás}}" → "Limpeza de" + gold "Sofás"
 */
const ServicePageTitle = ({ children, className = "" }: ServicePageTitleProps) => {
  if (typeof children !== "string") {
    return (
      <h1 className={`text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-8 text-center ${className}`}>
        {children}
      </h1>
    );
  }

  // Parse {{keyword}} syntax for gold highlighting
  const parts = children.split(/(\{\{[^}]+\}\})/g);
  
  return (
    <h1 className={`text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-8 text-center ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith("{{") && part.endsWith("}}")) {
          const keyword = part.slice(2, -2);
          return (
            <span key={index} className="text-[#beb47d]">
              {keyword}
            </span>
          );
        }
        return part;
      })}
    </h1>
  );
};

export default ServicePageTitle;
