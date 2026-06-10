import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCart, usePersona } from "@/store";
import { getProduct } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { open, closeCart, items, subtotal, count, setQty, removeItem, checkout } =
    useCart();
  const { persona } = usePersona();

  if (!open) return null;

  // Free delivery over $50 — a small, real piece of order logic.
  const FREE_THRESHOLD = 50;
  const deliveryFee = subtotal >= FREE_THRESHOLD || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + deliveryFee;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
        onClick={closeCart}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl animate-[slideIn_0.25s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-primo-900 text-white">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Your next delivery
              </div>
              <div className="text-[11px] text-slate-500">
                {count} {count === 1 ? "item" : "items"} · {persona.location}
              </div>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                Your delivery is empty
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Add products from Home or the Catalog.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;
                return (
                  <li
                    key={item.productId}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        {product.brand}
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatCurrency(product.pricePerUnit)} each
                      </div>
                      <div className="mt-2 inline-flex items-center rounded-lg border border-slate-200">
                        <button
                          onClick={() =>
                            setQty(item.productId, item.quantity - 1)
                          }
                          className="grid h-7 w-7 place-items-center text-slate-500 hover:bg-slate-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQty(item.productId, item.quantity + 1)
                          }
                          className="grid h-7 w-7 place-items-center text-slate-500 hover:bg-slate-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(product.pricePerUnit * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-coral-500/10 hover:text-coral-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer / checkout */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 p-5">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  Delivery
                </span>
                <span className="font-medium text-slate-800">
                  {deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-[11px] text-slate-400">
                  Add {formatCurrency(FREE_THRESHOLD - subtotal)} more for free
                  delivery.
                </p>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-1.5 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Button
              variant="default"
              className="mt-4 w-full gap-1.5"
              onClick={() => checkout()}
            >
              <Truck className="h-4 w-4" />
              Place order
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
