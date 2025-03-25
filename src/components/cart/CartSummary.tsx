
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between">
        <span className="text-slate-500 dark:text-slate-400">Sous-total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between font-medium text-lg">
        <span>Total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}
