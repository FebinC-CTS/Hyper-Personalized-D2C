import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { ChatMessage, Order, Persona, PersonaId } from "@/types";
import { getPersona, personas } from "@/data/personas";
import { getProduct } from "@/data/products";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

interface PersonaContextValue {
  persona: Persona;
  personas: Persona[];
  setPersonaId: (id: PersonaId) => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

interface AssistantContextValue {
  open: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  messages: ChatMessage[];
  appendMessage: (m: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  resetMessages: () => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

// ── Toasts ──────────────────────────────────────────────────────────────────
export interface Toast {
  id: string;
  message: string;
  tone: "default" | "success" | "error";
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, tone?: Toast["tone"]) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  checkout: () => Order | null;
  lastPlaced: Order | null;
  paused: boolean;
  togglePaused: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaIdState] = useState<PersonaId>("sarah");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [lastPlaced, setLastPlaced] = useState<Order | null>(null);
  const [paused, setPaused] = useState(false);

  const persona = useMemo(() => getPersona(personaId), [personaId]);

  // ── Toasts ──
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: Toast["tone"] = "default") => {
      const id = uid();
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    []
  );

  const setPersonaId = useCallback((id: PersonaId) => {
    setPersonaIdState(id);
    setMessages([]);
    setCartItems([]);
    setCartOpen(false);
    setAssistantOpen(false);
    setLastPlaced(null);
    setPaused(false);
  }, []);

  const appendMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const updateMessage = useCallback(
    (id: string, patch: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
      );
    },
    []
  );

  // ── Cart ──
  const addItem = useCallback(
    (productId: string, qty = 1) => {
      setCartItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + qty }
              : i
          );
        }
        return [...prev, { productId, quantity: qty }];
      });
      const product = getProduct(productId);
      toast(`Added ${product?.name ?? "item"} to your delivery`, "success");
    },
    [toast]
  );

  const setQty = useCallback((productId: string, qty: number) => {
    setCartItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) =>
            i.productId === productId ? { ...i, quantity: qty } : i
          )
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setCartItems([]), []);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, i) => {
        const p = getProduct(i.productId);
        return sum + (p ? p.pricePerUnit * i.quantity : 0);
      }, 0),
    [cartItems]
  );

  const count = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  const checkout = useCallback((): Order | null => {
    if (cartItems.length === 0) {
      toast("Your delivery is empty — add something first.", "error");
      return null;
    }
    const order: Order = {
      id: `live-${uid().slice(0, 8)}`,
      personaId,
      date: new Date().toISOString().slice(0, 10),
      items: cartItems.map((i) => ({ ...i })),
      total:
        Math.round(
          cartItems.reduce((sum, i) => {
            const p = getProduct(i.productId);
            return sum + (p ? p.pricePerUnit * i.quantity : 0);
          }, 0) * 100
        ) / 100,
    };
    setLastPlaced(order);
    setCartItems([]);
    setCartOpen(false);
    setPaused(false);
    toast("Order placed — arriving this Friday. 🚚", "success");
    return order;
  }, [cartItems, personaId, toast]);

  const togglePaused = useCallback(() => {
    setPaused((p) => {
      const next = !p;
      toast(
        next ? "Deliveries paused." : "Deliveries resumed.",
        next ? "default" : "success"
      );
      return next;
    });
  }, [toast]);

  const personaValue = useMemo<PersonaContextValue>(
    () => ({
      persona,
      personas,
      setPersonaId,
    }),
    [persona, setPersonaId]
  );

  const assistantValue = useMemo<AssistantContextValue>(
    () => ({
      open: assistantOpen,
      openAssistant: () => setAssistantOpen(true),
      closeAssistant: () => setAssistantOpen(false),
      toggleAssistant: () => setAssistantOpen((v) => !v),
      messages,
      appendMessage,
      updateMessage,
      resetMessages: () => setMessages([]),
    }),
    [assistantOpen, messages, appendMessage, updateMessage]
  );

  const toastValue = useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss }),
    [toasts, toast, dismiss]
  );

  const cartValue = useMemo<CartContextValue>(
    () => ({
      items: cartItems,
      count,
      subtotal,
      open: cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      addItem,
      setQty,
      removeItem,
      clear,
      checkout,
      lastPlaced,
      paused,
      togglePaused,
    }),
    [
      cartItems,
      count,
      subtotal,
      cartOpen,
      addItem,
      setQty,
      removeItem,
      clear,
      checkout,
      lastPlaced,
      paused,
      togglePaused,
    ]
  );

  return (
    <PersonaContext.Provider value={personaValue}>
      <ToastContext.Provider value={toastValue}>
        <CartContext.Provider value={cartValue}>
          <AssistantContext.Provider value={assistantValue}>
            {children}
          </AssistantContext.Provider>
        </CartContext.Provider>
      </ToastContext.Provider>
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona must be used inside StoreProvider");
  return ctx;
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used inside StoreProvider");
  return ctx;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside StoreProvider");
  return ctx;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside StoreProvider");
  return ctx;
}
