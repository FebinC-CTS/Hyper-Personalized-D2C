import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dropdown = DropdownMenu.Root;
export const DropdownTrigger = DropdownMenu.Trigger;

export const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      align="end"
      className={cn(
        "z-50 min-w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-lift",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  </DropdownMenu.Portal>
));
DropdownContent.displayName = "DropdownContent";

interface DropdownItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenu.Item> {
  selected?: boolean;
}

export const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Item>,
  DropdownItemProps
>(({ className, selected, children, ...props }, ref) => (
  <DropdownMenu.Item
    ref={ref}
    className={cn(
      "flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-slate-700 outline-none",
      "focus:bg-slate-100 data-[highlighted]:bg-slate-100",
      selected && "text-primo-700",
      className
    )}
    {...props}
  >
    <span className="flex-1">{children}</span>
    {selected && <Check className="h-4 w-4 text-primo-700" />}
  </DropdownMenu.Item>
));
DropdownItem.displayName = "DropdownItem";

export const DropdownLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400",
      className
    )}
    {...props}
  />
);

export const DropdownSeparator = () => (
  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
);
