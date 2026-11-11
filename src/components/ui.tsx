import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./Icon";
import { cn } from "../lib/utils";

/* ---------------------------------------------------------------- toasts */

interface ToastApi {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastApi>({ toast: () => {} });

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Array<{ id: number; message: string }>>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string) => {
    const id = ++counter.current;
    setItems((prev) => [...prev.slice(-2), { id, message }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 2800);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {items.map((item) => (
          <div className="toast" key={item.id}>
            <span className="toast-icon">
              <Icon name="check" size={15} strokeWidth={2.2} />
            </span>
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext).toast;

/* ----------------------------------------------------------------- sheet */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}

export const Sheet = ({ open, onClose, title, subtitle, children, wide }: SheetProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => {
      ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }, 60);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-layer">
      <button className="sheet-backdrop" aria-label="Close" onClick={onClose} tabIndex={-1} />
      <div
        className={cn("sheet", wide && "sheet-wide")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
      >
        <div className="sheet-grab" aria-hidden="true" />
        <div className="sheet-head">
          <div>
            {title && <h2 className="sheet-title">{title}</h2>}
            {subtitle && <p className="sheet-subtitle">{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- controls */

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id?: string;
}

export const Toggle = ({ checked, onChange, label, id }: ToggleProps) => (
  <button
    type="button"
    id={id}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    className={cn("toggle", checked && "is-on")}
    onClick={() => onChange(!checked)}
  >
    <span className="toggle-knob" />
  </button>
);

interface SegmentedProps<T extends string> {
  value: T;
  options: Array<{ value: T; label: string; icon?: ReactNode }>;
  onChange: (value: T) => void;
  label: string;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: SegmentedProps<T>) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn("segmented-item", value === option.value && "is-active")}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- visuals */

interface RingProps {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
  trackOpacity?: number;
}

export const ProgressRing = ({
  value,
  size = 64,
  stroke = 4,
  children,
  className,
  trackOpacity = 0.14,
}: RingProps) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div className={cn("ring", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          style={{ opacity: trackOpacity }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ring-value"
        />
      </svg>
      <div className="ring-content">{children}</div>
    </div>
  );
};

export const GeoBackdrop = ({ className }: { className?: string }) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={cn("geo", className)}
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id={`geo-${id}`} width="80" height="80" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="0.9">
            <path d="M40 4 76 40 40 76 4 40z" />
            <path d="M40 16 64 40 40 64 16 40z" />
            <path d="M4 40h72M40 4v72" opacity="0.5" />
            <circle cx="40" cy="40" r="7" />
            <circle cx="0" cy="0" r="5" />
            <circle cx="80" cy="0" r="5" />
            <circle cx="0" cy="80" r="5" />
            <circle cx="80" cy="80" r="5" />
          </g>
        </pattern>
      </defs>
      <rect width="400" height="400" fill={`url(#geo-${id})`} />
    </svg>
  );
};

export const Stars = ({ className }: { className?: string }) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={cn("stars", className)} viewBox="0 0 600 300" aria-hidden="true">
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="470" cy="60" r="180" fill={`url(#glow-${id})`} />
      {[
        [60, 40, 1.4],
        [120, 90, 1],
        [210, 30, 1.6],
        [300, 70, 1],
        [390, 120, 1.3],
        [520, 160, 0.9],
        [90, 180, 0.9],
        [160, 240, 1.2],
        [270, 200, 0.8],
        [430, 220, 1.1],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="currentColor" opacity={0.55} />
      ))}
    </svg>
  );
};

export const EmptyState = ({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) => (
  <div className="empty">
    <div className="empty-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{body}</p>
    {action}
  </div>
);
