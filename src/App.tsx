import {
  annualCommitment,
  datesBetween,
  nextUnpaid,
  isoDate,
  type Schedule,
  type Frequency,
} from "./paymentSchedule";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

type IconName =
  | "home"
  | "wallet"
  | "calendar"
  | "chart"
  | "plus"
  | "chevron"
  | "arrow"
  | "bell"
  | "close"
  | "check"
  | "trend"
  | "spark"
  | "search"
  | "shield"
  | "wifi"
  | "music"
  | "gym"
  | "bolt"
  | "phone"
  | "house"
  | "logout";
type Page = "Inicio" | "Mis pagos" | "Calendario" | "Presupuesto";
type Category = string;
type PaymentAction = "edit" | "paid" | "duplicate" | "delete";
type Payment = Schedule & {
  method?: string;
  notes?: string;
  occurrenceDate?: string;
  id: number;
  name: string;
  detail: string;
  amount: number;
  day: number;
  category: Category;
  icon: IconName | "netflix";
  color: string;
};

function Icon({
  name,
  size = 20,
  ...props
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
      </>
    ),
    wallet: (
      <>
        <path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6" />
        <path d="M21 12h-5v5h5M17 14.5h.01" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2M8 18h2" />
      </>
    ),
    chart: (
      <>
        <path d="M12 3a9 9 0 1 0 9 9h-9Z" />
        <path d="M16 3.5v4.5h4.5A9 9 0 0 0 16 3.5Z" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    trend: (
      <>
        <path d="m3 6 6 6 4-4 8 8M15 16h6v-6" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    wifi: (
      <>
        <path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0" />
        <circle cx="12" cy="20" r=".6" />
      </>
    ),
    music: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M6.5 9a16 16 0 0 1 11 1M7 12a13 13 0 0 1 10 1M8 15a10 10 0 0 1 8 1" />
      </>
    ),
    gym: (
      <>
        <path d="m6 6 12 12M3 8l5-5M16 21l5-5M2 5l3-3M19 22l3-3M8 11l3-3M13 16l3-3" />
      </>
    ),
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7Z" />,
    phone: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <path d="M10 18h4" />
      </>
    ),
    house: (
      <>
        <path d="m3 10 9-7 9 7M5 9v12h14V9M10 21v-7h4v7" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5M9 12h12m-5-5 5 5-5 5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

const seedPayments = [
  {
    id: 1,
    name: "Netflix",
    detail: "Plan Estándar",
    amount: 219,
    day: 16,
    category: "Estilo de vida",
    icon: "netflix",
    color: "netflix",
  },
  {
    id: 2,
    name: "Spotify",
    detail: "Premium Individual",
    amount: 129,
    day: 18,
    category: "Estilo de vida",
    icon: "music",
    color: "spotify",
  },
  {
    id: 3,
    name: "Internet",
    detail: "Telmex · Fibra óptica",
    amount: 599,
    day: 20,
    category: "Servicios",
    icon: "wifi",
    color: "internet",
  },
  {
    id: 4,
    name: "Gimnasio",
    detail: "Smart Fit · Plan Black",
    amount: 699,
    day: 22,
    category: "Estilo de vida",
    icon: "gym",
    color: "gym",
  },
  {
    id: 5,
    name: "Renta",
    detail: "Mi departamento",
    amount: 5800,
    day: 1,
    category: "Hogar",
    icon: "house",
    color: "rent",
  },
  {
    id: 6,
    name: "Mi auto",
    detail: "Mensualidad y seguro",
    amount: 3450,
    day: 5,
    category: "Transporte",
    icon: "shield",
    color: "internet",
  },
  {
    id: 7,
    name: "Luz",
    detail: "CFE · Estimado mensual",
    amount: 854,
    day: 12,
    category: "Hogar",
    icon: "bolt",
    color: "gym",
  },
  {
    id: 8,
    name: "Celular",
    detail: "Telcel · Plan mensual",
    amount: 700,
    day: 25,
    category: "Servicios",
    icon: "phone",
    color: "rent",
  },
];
const categoryColors: { name: Category; color: string }[] = [
  { name: "Hogar", color: "#0b805d" },
  { name: "Transporte", color: "#8dccac" },
  { name: "Servicios", color: "#ebce79" },
  { name: "Estilo de vida", color: "#dbe5df" },
];
const initialPayments: Payment[] = seedPayments.map((p) => ({
  ...p,
  icon: p.icon as Payment["icon"],
  date: `2025-09-${String(p.day).padStart(2, "0")}`,
  recurring: true,
  frequency: "mensual",
  customDays: 30,
  paidDates: [],
}));
const categoryColor = (name: string) =>
  categoryColors.find((c) => c.name === name)?.color ||
  ["#729bc2", "#bd9dc6", "#99b875", "#d5a08b"][
    Array.from(name).reduce((sum, c) => sum + c.charCodeAt(0), 0) % 4
  ];
const frequencyLabels: Record<Frequency, string> = {
  semanal: "Semanal",
  quincenal: "Quincenal (cada 14 días)",
  mensual: "Mensual",
  anual: "Anual",
  personalizada: "Personalizada",
};
const pages: { name: Page; icon: IconName }[] = [
  { name: "Inicio", icon: "home" },
  { name: "Mis pagos", icon: "wallet" },
  { name: "Calendario", icon: "calendar" },
  { name: "Presupuesto", icon: "chart" },
];

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);

function Brand() {
  return (
    <div className="brand">
      <span className="brand-symbol">
        <svg width="25" height="26" viewBox="0 0 25 26" fill="none">
          <path
            d="m4 9 8.5-5L21 9l-8.5 5L4 9Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="m4 14 8.5 5 8.5-5M4 19l8.5 5 8.5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>
        ¿Cuánto Pago<span className="brand-question">?</span>
      </span>
    </div>
  );
}

function PaymentRow({
  payment,
  onClick,
  onAction,
}: {
  payment: Payment;
  month: number;
  onClick: () => void;
  onAction: (payment: Payment, action: PaymentAction) => void;
}) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const floatingMenuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    maxHeight: number;
    maxWidth: number;
  } | null>(null);
  const date = payment.occurrenceDate || payment.date;
  const paid = payment.paidDates.includes(date);
  useLayoutEffect(() => {
    if (!menuOpen) return;
    const viewport = window.visualViewport;
    const reposition = () => {
      const trigger = menuRef.current?.querySelector("summary");
      const menu = floatingMenuRef.current;
      if (!trigger || !menu) return;
      const anchor = trigger.getBoundingClientRect();
      const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
      const topEdge = (viewport?.offsetTop ?? 0) + 8;
      const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth) - 16;
      const viewportBottom = topEdge + (viewport?.height ?? window.innerHeight) - 16;
      const navigation = document.querySelector(".bottom-nav")?.getBoundingClientRect();
      const bottomEdge =
        navigation && navigation.height > 0
          ? Math.min(viewportBottom, navigation.top - 8)
          : viewportBottom;
      const maxHeight = Math.max(0, bottomEdge - topEdge);
      const maxWidth = Math.max(0, rightEdge - leftEdge);
      const height = Math.min(menu.scrollHeight + 2, maxHeight);
      const width = Math.min(205, maxWidth);
      const below = bottomEdge - anchor.bottom - 4;
      const above = anchor.top - topEdge - 4;
      const openUpward = below < height && above > below;
      const desiredTop = openUpward ? anchor.top - height - 4 : anchor.bottom + 4;
      setMenuPosition({
        top: Math.max(topEdge, Math.min(desiredTop, bottomEdge - height)),
        left: Math.max(leftEdge, Math.min(anchor.right - width, rightEdge - width)),
        maxHeight,
        maxWidth,
      });
    };
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    viewport?.addEventListener("resize", reposition);
    viewport?.addEventListener("scroll", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      viewport?.removeEventListener("resize", reposition);
      viewport?.removeEventListener("scroll", reposition);
    };
  }, [menuOpen]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !floatingMenuRef.current?.contains(event.target as Node)
      ) {
        menuRef.current?.removeAttribute("open");
        setMenuOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuRef.current?.open) {
        menuRef.current.open = false;
        setMenuOpen(false);
        menuRef.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <div className="payment-item">
      <button
        className="payment-row"
        onClick={onClick}
        aria-label={`Ver detalles de ${payment.name}`}
      >
        <span className={`service-icon ${payment.color}`}>
          {payment.icon === "netflix" ? (
            <span className="netflix-letter">N</span>
          ) : (
            <Icon name={payment.icon} size={23} />
          )}
        </span>
        <span className="payment-description">
          <strong>{payment.name}</strong>
          <span>
            {paid ? "Pagado · " : ""}
            {payment.detail}
          </span>
        </span>
        <span className="payment-date">
          {new Date(`${date}T12:00:00`).toLocaleDateString("es-MX", {
            day: "numeric",
            month: "short",
          })}
        </span>
        <span className="payment-amount">
          {money(payment.amount)}
          <small>{paid ? "PAGADO" : "MXN"}</small>
        </span>
      </button>
      <details
        className="payment-actions"
        ref={menuRef}
        onToggle={(event) => setMenuOpen(event.currentTarget.open)}
      >
        <summary aria-label={`Acciones de ${payment.name}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="5" r="1.7" />
            <circle cx="12" cy="12" r="1.7" />
            <circle cx="12" cy="19" r="1.7" />
          </svg>
        </summary>
        {menuOpen &&
          createPortal(
            <div
              className="payment-menu"
              ref={floatingMenuRef}
              style={{ ...menuPosition, visibility: menuPosition ? "visible" : "hidden" }}
            >
              {(
                [
                  ["edit", "Editar pago"],
                  ["paid", paid ? "Ya está pagado" : "Marcar como pagado"],
                  ["duplicate", "Duplicar pago"],
                  ["delete", "Eliminar pago"],
                ] as [PaymentAction, string][]
              ).map(([action, label]) => (
                <button
                  key={action}
                  disabled={action === "paid" && paid}
                  className={action === "delete" ? "danger-text" : ""}
                  onClick={() => {
                    menuRef.current!.open = false;
                    setMenuOpen(false);
                    onAction(payment, action);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>,
            document.body,
          )}
      </details>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<Page>("Inicio");
  const [payments, setPayments] = useState(initialPayments);
  const [month, setMonth] = useState(0);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [popover, setPopover] = useState<"profile" | "notifications" | null>(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [calendarDay, setCalendarDay] = useState(16);
  const [budget, setBudget] = useState(16000);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const detailRef = useRef<HTMLDialogElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [recordView, setRecordView] = useState<"all" | "history">("all");
  const [formError, setFormError] = useState("");
  const [editing, setEditing] = useState<Payment | null>(null);
  const [recurring, setRecurring] = useState(true);
  const [frequency, setFrequency] = useState<Frequency>("mensual");
  const [deleting, setDeleting] = useState<Payment | null>(null);
  const deleteRef = useRef<HTMLDialogElement>(null);
  const monthStart = isoDate(new Date(Date.UTC(2025, month + 8, 1)));
  const selectedMonthName = new Date(`${monthStart}T12:00:00`).toLocaleDateString("es-MX", {
    month: "long",
  });
  const selectedYear = Number(monthStart.slice(0, 4));
  const monthEnd = isoDate(new Date(Date.UTC(2025, month + 9, 0)));
  const occurrences: Payment[] = payments.flatMap((p) =>
    datesBetween(p, monthStart, monthEnd).map((date) => ({
      ...p,
      day: Number(date.slice(8)),
      occurrenceDate: date,
    })),
  );
  const total = occurrences.reduce((sum, p) => sum + p.amount, 0);
  const annualTotal = payments.reduce((sum, p) => sum + annualCommitment(p, monthStart), 0);
  const categories = Array.from(new Set(payments.map((p) => p.category))).map((name) => ({
    name,
    color: categoryColor(name),
  }));
  const upcoming = occurrences
    .filter((p) => p.day >= (month === 0 ? 15 : 1) && !p.paidDates.includes(p.occurrenceDate!))
    .sort((a, b) => a.day - b.day);
  const listPayments = payments.map((p) => ({
    ...p,
    occurrenceDate: nextUnpaid(p, monthStart) || p.paidDates[p.paidDates.length - 1] || p.date,
  }));
  const visiblePayments =
    recordView === "all"
      ? listPayments
      : payments.flatMap((p) => p.paidDates.map((date) => ({ ...p, occurrenceDate: date })));
  const categoryTotals = categories
    .map((c) => ({
      ...c,
      total: occurrences.filter((p) => p.category === c.name).reduce((s, p) => s + p.amount, 0),
    }))
    .filter((c) => occurrences.some((p) => p.category === c.name));
  const share = (value: number) => (total > 0 ? (value / total) * 100 : 0);
  let angle = 0;
  const gradient =
    categoryTotals
      .map((c) => {
        const start = angle;
        angle += share(c.total);
        return `${c.color} ${start}% ${angle}%`;
      })
      .join(", ") || "#edf2e8 0% 100%";
  useEffect(() => {
    if (deleting) deleteRef.current?.showModal();
    else deleteRef.current?.close();
  }, [deleting]);
  useEffect(() => {
    if (filter !== "Todos" && !payments.some((p) => p.category === filter)) setFilter("Todos");
  }, [payments, filter]);
  function openNew() {
    setFormError("");
    setEditing(null);
    setRecurring(true);
    setFrequency("mensual");
    setModal(true);
  }
  function handleAction(payment: Payment, action: PaymentAction) {
    const original = payments.find((p) => p.id === payment.id)!;
    if (action === "edit") {
      setFormError("");
      setEditing(original);
      setRecurring(original.recurring);
      setFrequency(original.frequency);
      setModal(true);
    }
    if (action === "delete") setDeleting(original);
    if (action === "duplicate") {
      setPayments((previous) => [
        ...previous,
        { ...original, id: Date.now(), name: `${original.name} (copia)`, paidDates: [] },
      ]);
      setToast("Pago duplicado. Puedes editarlo desde su menú.");
    }
    if (action === "paid") {
      const date = payment.occurrenceDate || payment.date;
      setPayments((previous) =>
        previous.map((p) =>
          p.id === payment.id ? { ...p, paidDates: [...new Set([...p.paidDates, date])] } : p,
        ),
      );
      setToast("Pago marcado como pagado. El historial y calendario se actualizaron.");
    }
  }

  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal]);
  useEffect(() => {
    if (selected) detailRef.current?.showModal();
    else detailRef.current?.close();
  }, [selected]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    function dismiss(event: MouseEvent) {
      if (!popoverRef.current?.contains(event.target as Node)) setPopover(null);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setPopover(null);
    }
    document.addEventListener("click", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  function navigate(next: Page) {
    setPage(next);
    setPopover(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function addPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name")).trim();
    const rawCategory = String(data.get("category")).trim();
    const category =
      categories.find((c) => c.name.toLocaleLowerCase() === rawCategory.toLocaleLowerCase())
        ?.name || rawCategory;
    const amount = Number(data.get("amount"));
    const date = String(data.get("date"));
    const endDate = recurring ? String(data.get("endDate") || "") : "";
    if (!name || !category || !Number.isFinite(amount) || amount <= 0) {
      setFormError("Escribe un nombre, una categoría y un importe válido.");
      return;
    }
    if (endDate && endDate < date) {
      setFormError("La fecha de finalización debe ser posterior o igual al próximo pago.");
      return;
    }
    const payment: Payment = {
      id: editing?.id ?? Date.now(),
      name,
      detail: editing?.detail || (recurring ? "Pago recurrente" : "Pago único"),
      amount,
      date,
      day: Number(date.slice(8)),
      category,
      icon: editing?.icon || "wallet",
      color: editing?.color || "rent",
      recurring,
      frequency,
      customDays: Number(data.get("customDays")) || 30,
      endDate: endDate || undefined,
      method: String(data.get("method") || "").trim(),
      notes: String(data.get("notes") || "").trim(),
      paidDates: editing?.paidDates || [],
    };
    setPayments((previous) =>
      editing ? previous.map((p) => (p.id === editing.id ? payment : p)) : [...previous, payment],
    );
    setModal(false);
    setToast(
      editing
        ? "Pago actualizado. Tus totales ya están al día."
        : "Tu nuevo pago está listo. Un pendiente menos.",
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">MI ESPACIO PERSONAL</div>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {pages.map((item) => (
            <button
              key={item.name}
              className={page === item.name ? "nav-item active" : "nav-item"}
              onClick={() => navigate(item.name)}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
              {page === item.name && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-spark">
              <Icon name="spark" size={22} />
            </span>
            <strong>
              La tranquilidad
              <br />
              también se planea.
            </strong>
            <p>
              Un pago a la vez, estás
              <br />
              construyendo algo mejor.
            </p>
            <div className="note-decoration">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <button
            className="sidebar-profile"
            onClick={(event) => {
              event.stopPropagation();
              setPopover(popover === "profile" ? null : "profile");
            }}
          >
            <span className="avatar">AM</span>
            <span>
              <strong>Alex Martínez</strong>
              <small>Mi cuenta personal</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="desktop-date">Lunes, 15 de septiembre de 2025</div>
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="topbar-actions" ref={popoverRef}>
            <span className="all-clear">
              <span />
              Todo en orden
            </span>
            <button
              className={`icon-button notification-button ${popover === "notifications" ? "selected" : ""}`}
              aria-label="Ver notificaciones"
              aria-expanded={popover === "notifications"}
              onClick={() => setPopover(popover === "notifications" ? null : "notifications")}
            >
              <Icon name="bell" size={20} />
              <i />
            </button>
            <button
              className="avatar top-avatar"
              aria-label="Abrir perfil"
              aria-expanded={popover === "profile"}
              onClick={() => setPopover(popover === "profile" ? null : "profile")}
            >
              AM
            </button>
            {popover && (
              <div className="popover">
                {popover === "notifications" ? (
                  <>
                    <div className="popover-heading">
                      <strong>Tus recordatorios</strong>
                      <span className="count-badge">2</span>
                    </div>
                    <div className="notification-item">
                      <span className="notification-icon">
                        <Icon name="calendar" size={18} />
                      </span>
                      <div>
                        <strong>Netflix se paga mañana</strong>
                        <p>Tienes un pago de $219.00 programado para el 16 de septiembre.</p>
                        <small>Recordatorio de ejemplo</small>
                      </div>
                    </div>
                    <div className="notification-item">
                      <span className="notification-icon green">
                        <Icon name="check" size={18} />
                      </span>
                      <div>
                        <strong>Todo está en su lugar</strong>
                        <p>Ya tienes {payments.length} pagos organizados. ¡Vas muy bien!</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="profile-summary">
                      <span className="avatar large">AM</span>
                      <strong>Alex Martínez</strong>
                      <p>alex.martinez@ejemplo.com</p>
                      <span className="demo-badge">Cuenta de demostración</span>
                    </div>
                    <p className="demo-explanation">
                      Explora con tranquilidad. Los cambios de esta demo duran mientras mantengas
                      abierta la aplicación.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "Inicio" ? "MENOS PENDIENTES, MÁS TRANQUILIDAD" : "TU ESPACIO FINANCIERO"}
              </div>
              <h1>
                {page === "Inicio"
                  ? "Tu dinero, en orden."
                  : page === "Mis pagos"
                    ? "Cada pago, en su lugar."
                    : page === "Calendario"
                      ? "Anticípate a lo que viene."
                      : "Dale un plan a tu dinero."}
              </h1>
              <p>
                {page === "Inicio" ? (
                  <>¡Hola, Alex! Estos son tus compromisos de este mes.</>
                ) : page === "Mis pagos" ? (
                  "Una vista de todo lo que forma parte de tu mes."
                ) : page === "Calendario" ? (
                  "Tus compromisos, un día a la vez."
                ) : (
                  "Encuentra el equilibrio entre tus pagos y tus posibilidades."
                )}
              </p>
            </div>
            <div className="heading-actions">
              {page === "Inicio" && (
                <button className="primary-button quick-add" onClick={openNew}>
                  <Icon name="plus" size={19} />
                  Agregar pago
                </button>
              )}
              <label className="month-picker">
                <Icon name="calendar" size={17} />
                <input
                  type="month"
                  aria-label="Mes del resumen"
                  min="1900-01"
                  max="2100-12"
                  value={monthStart.slice(0, 7)}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, m] = e.target.value.split("-").map(Number);
                      setMonth((year - 2025) * 12 + m - 9);
                      setCalendarDay(1);
                    }
                  }}
                />
                <Icon name="chevron" size={13} />
              </label>
            </div>
          </section>

          {page === "Inicio" && (
            <>
              <section className="summary-grid" aria-label="Resumen de compromisos">
                <div className="monthly-card">
                  <svg className="hero-art" viewBox="0 0 340 300" fill="none" aria-hidden="true">
                    <circle cx="286" cy="160" r="149" stroke="white" strokeWidth="1" />
                    <circle cx="286" cy="160" r="118" stroke="white" strokeWidth="1" />
                    <circle cx="286" cy="160" r="87" stroke="white" strokeWidth="1" />
                    <circle cx="286" cy="160" r="56" stroke="white" strokeWidth="1" />
                    <path d="m185 235 160-160" stroke="white" strokeWidth="38" opacity=".2" />
                  </svg>
                  <div className="card-overline">
                    <span className="card-wallet">
                      <Icon name="wallet" size={18} />
                    </span>
                    Tu compromiso mensual<span className="currency-tag">MXN</span>
                  </div>
                  <div className="hero-amount">
                    {money(total).split(".")[0]}
                    <span>.{money(total).split(".")[1]}</span>
                  </div>
                  <p className="monthly-description">
                    <span className="tiny-dot" />
                    {occurrences.length} pagos programados este mes.
                  </p>
                  <div className="monthly-bottom">
                    <div>
                      <span className="trend-badge">
                        <Icon name="trend" size={13} />
                        {payments.filter((p) => p.recurring).length}
                      </span>
                      <span>compromisos recurrentes registrados</span>
                    </div>
                    <button onClick={() => navigate("Mis pagos")} aria-label="Ver mis pagos">
                      <Icon name="arrow" size={20} />
                    </button>
                  </div>
                </div>
                <div className="annual-card card">
                  <div className="annual-heading">
                    <span>Una mirada al año</span>
                    <span className="soft-icon">
                      <Icon name="calendar" size={17} />
                    </span>
                  </div>
                  <div className="annual-amount">
                    {money(annualTotal).split(".")[0]}
                    <span>.{money(annualTotal).split(".")[1]}</span>
                  </div>
                  <p>Tu compromiso anual estimado</p>
                  <p className="annual-explanation">
                    Estimación anual basada en tus pagos recurrentes registrados. El monto puede
                    variar.
                  </p>
                  <div className="annual-chart" aria-hidden="true">
                    {[42, 56, 49, 68, 61, 74, 66, 80, 73, 73, 73, 73].map((h, i) => (
                      <div
                        key={i}
                        className={
                          i === month + 8 ? "current-bar" : i > month + 8 ? "future-bar" : ""
                        }
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="chart-axis">
                    <span>ENE</span>
                    <span>DIC</span>
                  </div>
                </div>
              </section>

              <section className="dashboard-grid">
                <div className="card upcoming-card">
                  <div className="section-heading">
                    <div>
                      <div className="title-with-count">
                        <h2>Próximos pagos</h2>
                        <span className="count-badge">{upcoming.length}</span>
                      </div>
                      <p>Un vistazo a lo que viene.</p>
                    </div>
                    <button className="text-button" onClick={() => navigate("Mis pagos")}>
                      Ver todos
                      <Icon name="arrow" size={15} />
                    </button>
                  </div>
                  <div className="payments-list">
                    {!upcoming.length && (
                      <div className="empty-state">
                        <Icon name="check" size={26} />
                        <h3>{payments.length ? "Todo al día" : "Tu primer paso empieza aquí"}</h3>
                        <p>
                          {payments.length
                            ? "No hay pagos pendientes para lo que queda del mes."
                            : "Agrega tu primer pago y comienza a poner todo en orden."}
                        </p>
                      </div>
                    )}
                    {upcoming.slice(0, 4).map((payment) => (
                      <PaymentRow
                        key={`${payment.id}-${payment.occurrenceDate}`}
                        payment={payment}
                        onAction={handleAction}
                        month={month}
                        onClick={() => setSelected(payment)}
                      />
                    ))}
                  </div>
                  <button className="add-payment-button" onClick={openNew}>
                    <Icon name="plus" size={18} />
                    Agregar un pago
                  </button>
                  <div className="payment-reminder">
                    <span className="reminder-icon">
                      <Icon name="bell" size={16} />
                    </span>
                    <p>
                      Un recordatorio hoy.<strong> Un pendiente menos mañana.</strong>
                    </p>
                  </div>
                </div>

                <div className="card distribution-card">
                  <div className="section-heading">
                    <div>
                      <h2>¿A dónde va tu dinero?</h2>
                      <p>Cada peso tiene su lugar.</p>
                    </div>
                    <span className="soft-icon">
                      <Icon name="chart" size={18} />
                    </span>
                  </div>
                  <div className="donut-wrap">
                    <div
                      className="donut"
                      style={{ background: `conic-gradient(${gradient})` }}
                      role="img"
                      aria-label={categoryTotals
                        .map((c) => `${c.name}: ${Math.round(share(c.total))} por ciento`)
                        .join(", ")}
                    >
                      <div className="donut-hole">
                        <span>Total mensual</span>
                        <strong>{money(total).split(".")[0]}</strong>
                        <small>MXN</small>
                      </div>
                    </div>
                    <span className="donut-orbit orbit-one" />
                    <span className="donut-orbit orbit-two" />
                  </div>
                  <div className="category-legend">
                    {!categoryTotals.length && (
                      <p className="category-empty">Sin pagos programados este mes.</p>
                    )}
                    {categoryTotals.map((c) => (
                      <button
                        key={c.name}
                        className="category-row"
                        onClick={() => {
                          setFilter(c.name);
                          navigate("Mis pagos");
                        }}
                      >
                        <span className="category-dot" style={{ background: c.color }} />
                        <span>{c.name}</span>
                        <strong>{money(c.total).split(".")[0]}</strong>
                        <small>{Math.round(share(c.total))}%</small>
                      </button>
                    ))}
                  </div>
                  <div className="distribution-footer">
                    <span className="tiny-dot" />
                    Un panorama más claro, mejores decisiones.
                  </div>
                </div>
              </section>
              <div className="insight-card">
                <span className="insight-icon">
                  <Icon name="spark" size={24} />
                </span>
                <div>
                  <strong>Vas por buen camino, Alex.</strong>
                  <p>Conocer tus pagos es el primer paso para tomar el control de tu dinero.</p>
                </div>
                <span className="insight-line" />
                <span className="insight-caption">Un mes a la vez.</span>
                <svg className="plant-art" viewBox="0 0 70 66" fill="none" aria-hidden="true">
                  <path
                    d="M36 61V27M36 45C15 47 8 34 10 24c15-2 27 6 26 21ZM36 33C55 34 65 19 60 8 43 10 35 18 36 33Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path d="m21 34 15 11 15-25M24 62h25" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </>
          )}

          {page === "Mis pagos" && (
            <section className="card all-payments-card">
              <div className="section-heading">
                <div>
                  <h2>
                    Mis pagos <span className="count-badge">{payments.length}</span>
                  </h2>
                  <p>{money(total)} al mes · Todos tus compromisos</p>
                </div>
                <button className="primary-button" onClick={openNew}>
                  <Icon name="plus" size={18} />
                  <span>Nuevo pago</span>
                </button>
              </div>
              <div className="record-tabs" aria-label="Vista de pagos">
                <button
                  className={recordView === "all" ? "active" : ""}
                  aria-pressed={recordView === "all"}
                  onClick={() => setRecordView("all")}
                >
                  Todos los pagos
                </button>
                <button
                  className={recordView === "history" ? "active" : ""}
                  aria-pressed={recordView === "history"}
                  onClick={() => setRecordView("history")}
                >
                  Historial de pagados
                </button>
              </div>
              <div className="payment-filters">
                <label className="search-field">
                  <Icon name="search" size={18} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar un pago..."
                  />
                </label>
                <select
                  aria-label="Filtrar por categoría"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>Todos</option>
                  {categories.map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="payments-list">
                {visiblePayments
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(search.toLowerCase()) &&
                      (filter === "Todos" || p.category === filter),
                  )
                  .sort((a, b) =>
                    (a.occurrenceDate || a.date).localeCompare(b.occurrenceDate || b.date),
                  )
                  .map((p) => (
                    <PaymentRow
                      key={`${p.id}-${p.occurrenceDate}`}
                      payment={p}
                      onAction={handleAction}
                      month={month}
                      onClick={() => setSelected(p)}
                    />
                  ))}
                {!visiblePayments.some(
                  (p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()) &&
                    (filter === "Todos" || p.category === filter),
                ) && (
                  <div className="empty-state">
                    <Icon name="search" size={28} />
                    <h3>No encontramos ese pago</h3>
                    <p>Prueba con otro nombre o categoría.</p>
                    <button
                      className="text-button"
                      onClick={() => {
                        setSearch("");
                        setFilter("Todos");
                      }}
                    >
                      Mostrar todos
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {page === "Calendario" && (
            <section className="calendar-grid">
              <div className="card calendar-card">
                <div className="section-heading">
                  <h2>
                    {selectedMonthName} {selectedYear}
                  </h2>
                  <span className="calendar-key">
                    <i />
                    Con pagos
                  </span>
                </div>
                <div className="calendar-week">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
                <div className="calendar-days">
                  {Array.from(
                    {
                      length:
                        new Date(2025, month + 8, 1).getDay() === 0
                          ? 6
                          : new Date(2025, month + 8, 1).getDay() - 1,
                    },
                    (_, i) => (
                      <span key={`empty-${i}`} />
                    ),
                  )}
                  {Array.from({ length: new Date(2025, month + 9, 0).getDate() }, (_, i) => (
                    <button
                      key={i}
                      className={`${calendarDay === i + 1 ? "day-selected" : ""} ${occurrences.some((p) => p.day === i + 1) ? "has-payment" : ""}`}
                      onClick={() => setCalendarDay(i + 1)}
                      aria-label={`${i + 1} de ${selectedMonthName}${occurrences.some((p) => p.day === i + 1) ? ", tiene pagos" : ""}`}
                      aria-pressed={calendarDay === i + 1}
                    >
                      {i + 1}
                      {occurrences.some((p) => p.day === i + 1) && <span />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card day-payments">
                <div className="section-heading">
                  <div>
                    <h2>
                      {calendarDay} de {selectedMonthName}
                    </h2>
                    <p>Tus compromisos para este día.</p>
                  </div>
                </div>
                {occurrences
                  .filter((p) => p.day === calendarDay)
                  .map((p) => (
                    <PaymentRow
                      key={`${p.id}-${p.occurrenceDate}`}
                      payment={p}
                      onAction={handleAction}
                      month={month}
                      onClick={() => setSelected(p)}
                    />
                  ))}
                {!occurrences.some((p) => p.day === calendarDay) && (
                  <div className="empty-state">
                    <span className="empty-icon">
                      <Icon name="check" size={28} />
                    </span>
                    <h3>Un día sin pendientes</h3>
                    <p>No tienes pagos programados para este día.</p>
                  </div>
                )}
                <button className="add-payment-button" onClick={openNew}>
                  <Icon name="plus" size={18} />
                  Agregar un pago
                </button>
              </div>
            </section>
          )}

          {page === "Presupuesto" && (
            <section className="budget-grid">
              <div className="card budget-card">
                <span className="soft-icon">
                  <Icon name="wallet" size={24} />
                </span>
                <h2>Tu presupuesto mensual</h2>
                <p>¿Cuánto quieres destinar a tus compromisos?</p>
                <label className="budget-input">
                  <span>$</span>
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    step="500"
                    value={budget}
                    aria-label="Presupuesto mensual en MXN"
                    onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
                  />
                  <span>MXN</span>
                </label>
                <input
                  type="range"
                  min="5000"
                  max="40000"
                  step="500"
                  value={Math.min(40000, Math.max(5000, budget))}
                  aria-label="Ajustar presupuesto mensual"
                  onChange={(e) => setBudget(Number(e.target.value))}
                />
                <div className="budget-range-labels">
                  <span>$5,000</span>
                  <span>$40,000</span>
                </div>
                <div className="budget-progress-label">
                  <span>Comprometido</span>
                  <strong>{budget > 0 ? Math.round((total / budget) * 100) : "—"}%</strong>
                </div>
                <div className="budget-progress">
                  <div
                    style={{
                      width: `${budget > 0 ? Math.min((total / budget) * 100, 100) : 100}%`,
                      background: total > budget ? "#d69c34" : undefined,
                    }}
                  />
                </div>
                <div className="budget-values">
                  <div>
                    <span>Tus pagos</span>
                    <strong>{money(total)}</strong>
                  </div>
                  <div>
                    <span>
                      {budget >= total ? "Tu margen disponible" : "Por encima del presupuesto"}
                    </span>
                    <strong className={budget >= total ? "green-text" : "amber-text"}>
                      {money(Math.abs(budget - total))}
                    </strong>
                  </div>
                </div>
                <div className="budget-tip">
                  <Icon name={budget >= total ? "spark" : "bell"} size={20} />
                  <p>
                    {budget >= total
                      ? "Tienes espacio para tus metas. Aparta una parte de tu margen para ese plan que tienes en mente."
                      : "Tus pagos superan tu presupuesto. Revisa tus compromisos y encuentra dónde puedes hacer un pequeño ajuste."}
                  </p>
                </div>
                <small className="demo-note">
                  Simulador de ejemplo. No se guardan datos personales.
                </small>
              </div>
              <div className="card budget-breakdown">
                <div className="section-heading">
                  <div>
                    <h2>Así se distribuye tu plan</h2>
                    <p>Un poco de claridad en cada categoría.</p>
                  </div>
                </div>
                {categoryTotals.map((c) => (
                  <div className="budget-category" key={c.name}>
                    <div>
                      <span className="category-dot" style={{ background: c.color }} />
                      <strong>{c.name}</strong>
                      <span>{money(c.total)}</span>
                    </div>
                    <div className="mini-progress">
                      <span style={{ background: c.color, width: `${share(c.total)}%` }} />
                    </div>
                  </div>
                ))}
                <button className="add-payment-button" onClick={() => navigate("Mis pagos")}>
                  Revisar mis pagos
                  <Icon name="arrow" size={16} />
                </button>
              </div>
            </section>
          )}

          <footer className="page-footer">
            <span>
              <Icon name="shield" size={13} />
              Tu tranquilidad, primero.
            </span>
            <span>Hecho para llevarte bien con tu dinero.</span>
            <span className="demo-footer">Datos de ejemplo · MXN</span>
          </footer>
        </div>
      </main>
      <nav className="bottom-nav" aria-label="Navegación móvil">
        {pages.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.name)}
            className={page === item.name ? "active" : ""}
            aria-current={page === item.name ? "page" : undefined}
          >
            <span>
              <Icon name={item.icon} size={22} />
            </span>
            {item.name}
          </button>
        ))}
      </nav>

      <dialog
        ref={dialogRef}
        className="modal"
        onCancel={() => setModal(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(false);
        }}
      >
        <div className="modal-content">
          <button
            className="icon-button modal-close"
            aria-label="Cerrar formulario"
            onClick={() => setModal(false)}
          >
            <Icon name="close" />
          </button>
          <span className="modal-symbol">
            <Icon name="plus" size={26} />
          </span>
          <div className="eyebrow">UN PENDIENTE MENOS</div>
          <h2>{editing ? "Editar pago" : "Agrega un nuevo pago"}</h2>
          <p>Un lugar para cada compromiso.</p>
          {modal && (
            <form key={editing?.id || "new"} onSubmit={addPayment}>
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}
              <fieldset className="recurrence-picker">
                <legend>¿Este pago es recurrente?</legend>
                <div>
                  {[false, true].map((value) => (
                    <label key={String(value)} className={recurring === value ? "chosen" : ""}>
                      <input
                        type="radio"
                        name="recurrence"
                        checked={recurring === value}
                        onChange={() => setRecurring(value)}
                      />
                      {value ? "Pago recurrente" : "Pago único"}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label>
                Nombre del pago
                <input
                  name="name"
                  required
                  maxLength={80}
                  defaultValue={editing?.name}
                  placeholder="Ej. Internet de casa"
                />
              </label>
              <div className="form-columns">
                <label>
                  Importe por pago (MXN)
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0.01"
                    max="9999999"
                    step="0.01"
                    defaultValue={editing?.amount}
                    placeholder="0.00"
                  />
                </label>
                <label>
                  Categoría
                  <input
                    name="category"
                    required
                    maxLength={50}
                    list="payment-categories"
                    defaultValue={editing?.category}
                    placeholder="Ej. Mascotas"
                  />
                  <datalist id="payment-categories">
                    {categories.map((c) => (
                      <option key={c.name} value={c.name} />
                    ))}
                  </datalist>
                </label>
              </div>
              {recurring && (
                <div className="form-columns">
                  <label>
                    Frecuencia
                    <select
                      name="frequency"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as Frequency)}
                    >
                      {Object.entries(frequencyLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {frequency === "personalizada" && (
                    <label>
                      Repetir cada (días)
                      <input
                        type="number"
                        name="customDays"
                        min="1"
                        max="3650"
                        required
                        defaultValue={editing?.customDays || 30}
                      />
                    </label>
                  )}
                </div>
              )}
              <div className="form-columns">
                <label>
                  {recurring ? "Fecha del próximo pago" : "Fecha del pago"}
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={
                      editing?.date ||
                      `${monthStart.slice(0, 7)}-${String(Math.min(calendarDay, new Date(2025, month + 9, 0).getDate())).padStart(2, "0")}`
                    }
                  />
                </label>
                {recurring && (
                  <label>
                    Finaliza el (opcional)
                    <input type="date" name="endDate" defaultValue={editing?.endDate} />
                  </label>
                )}
              </div>
              <label>
                Método de pago (opcional)
                <input
                  name="method"
                  maxLength={80}
                  defaultValue={editing?.method}
                  placeholder="Ej. Tarjeta, transferencia, efectivo"
                />
              </label>
              <label>
                Notas (opcional)
                <textarea
                  name="notes"
                  maxLength={500}
                  rows={2}
                  defaultValue={editing?.notes}
                  placeholder="Algo que quieras recordar…"
                />
              </label>
              <div className="form-info">
                <Icon name="calendar" size={17} />
                <span>
                  {recurring
                    ? "Calculamos las próximas fechas según tu frecuencia. Quincenal significa cada 14 días."
                    : "Aparecerá en tu historial y calendario, sin sumarse al compromiso anual."}
                </span>
              </div>
              <button className="primary-button" type="submit">
                <Icon name="check" size={18} />
                {editing ? "Guardar cambios" : "Agregar pago"}
              </button>
              <p className="demo-note">Vista de ejemplo. Tus cambios no se guardan al recargar.</p>
            </form>
          )}
        </div>
      </dialog>
      <dialog
        ref={detailRef}
        className="modal detail-modal"
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <div className="modal-content">
          <button
            className="icon-button modal-close"
            aria-label="Cerrar detalle"
            onClick={() => setSelected(null)}
          >
            <Icon name="close" />
          </button>
          {selected && (
            <>
              <span className={`service-icon large-service ${selected.color}`}>
                {selected.icon === "netflix" ? (
                  <span className="netflix-letter">N</span>
                ) : (
                  <Icon name={selected.icon} size={30} />
                )}
              </span>
              <h2>{selected.name}</h2>
              <p>{selected.detail}</p>
              <div className="detail-amount">
                {money(selected.amount)}
                <small>
                  MXN · {selected.recurring ? frequencyLabels[selected.frequency] : "Pago único"}
                </small>
              </div>
              <dl className="detail-info">
                <div>
                  <dt>Próximo pago</dt>
                  <dd>
                    {new Date(
                      `${selected.occurrenceDate || selected.date}T12:00:00`,
                    ).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt>Categoría</dt>
                  <dd>{selected.category}</dd>
                </div>
                <div>
                  <dt>Frecuencia</dt>
                  <dd>
                    {selected.recurring
                      ? selected.frequency === "personalizada"
                        ? `Cada ${selected.customDays} días`
                        : frequencyLabels[selected.frequency]
                      : "Pago único"}
                  </dd>
                </div>
                <div>
                  <dt>Compromiso anual</dt>
                  <dd>
                    {selected.recurring
                      ? money(annualCommitment(selected, monthStart))
                      : "No aplica"}
                  </dd>
                </div>
                {selected.endDate && (
                  <div>
                    <dt>Finalización</dt>
                    <dd>{selected.endDate}</dd>
                  </div>
                )}
                {selected.method && (
                  <div>
                    <dt>Método de pago</dt>
                    <dd>{selected.method}</dd>
                  </div>
                )}
                {selected.notes && (
                  <div>
                    <dt>Notas</dt>
                    <dd>{selected.notes}</dd>
                  </div>
                )}
                <div>
                  <dt>Estado</dt>
                  <dd>
                    {selected.paidDates.includes(selected.occurrenceDate || selected.date)
                      ? "Pagado"
                      : "Pendiente"}
                  </dd>
                </div>
              </dl>
              <div className="form-info">
                <Icon name="shield" size={18} />
                <span>Solo organizamos tus pagos. No se realizan cargos.</span>
              </div>
              <button className="primary-button" onClick={() => setSelected(null)}>
                Todo claro
                <Icon name="check" size={18} />
              </button>
            </>
          )}
        </div>
      </dialog>
      <dialog
        ref={deleteRef}
        className="modal"
        onCancel={() => setDeleting(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDeleting(null);
        }}
      >
        <div className="modal-content">
          <h2>¿Eliminar este pago?</h2>
          <p>
            Se eliminará «{deleting?.name}» junto con su programación e historial. Esta acción no se
            puede deshacer.
          </p>
          <div className="confirmation-actions">
            <button className="add-payment-button" onClick={() => setDeleting(null)}>
              Cancelar
            </button>
            <button
              className="primary-button danger-button"
              onClick={() => {
                setPayments((previous) => previous.filter((p) => p.id !== deleting?.id));
                setDeleting(null);
                setToast("Pago eliminado. Tus totales se actualizaron.");
              }}
            >
              Eliminar pago
            </button>
          </div>
        </div>
      </dialog>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={18} />
          </span>
          {toast}
          <button aria-label="Cerrar mensaje" onClick={() => setToast("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
