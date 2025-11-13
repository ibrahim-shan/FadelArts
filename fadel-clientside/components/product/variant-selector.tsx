"use client";

// 1. Remove useState import
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = {
  name: string;
  values: string[];
};

// 2. Add new props: selectedValues and onSelect
export default function VariantSelector({
  variants,
  selectedValues,
  onSelect,
}: {
  variants: Variant[];
  selectedValues: Record<string, string>;
  onSelect: (name: string, value: string) => void;
}) {
  // 3. Remove the internal useState
  // const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  // 4. Remove the internal handleSelect function
  // const handleSelect = ...

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-4">
      {variants.map((variant) => (
        <div key={variant.name}>
          <h3 className="text-sm font-medium text-muted-foreground">
            {variant.name}:{" "}
            <span className="text-foreground font-semibold">
              {selectedValues[variant.name] || "..."}
            </span>
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {variant.values.map((value) => {
              // 5. Read from props
              const isSelected = selectedValues[variant.name] === value;
              return (
                <Button
                  key={value}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:bg-accent/50 dark:hover:text-foreground",
                  )}
                  // 6. Call the prop function
                  onClick={() => onSelect(variant.name, value)}
                >
                  {value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
