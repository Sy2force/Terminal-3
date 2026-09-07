import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

/**
 * Contrôles de formulaire admin partagés — charte claire Terminal 3.
 * Variables : --admin-* dans app/globals.css.
 *
 * Règles appliquées :
 * - label permanent au-dessus du champ (jamais le placeholder seul) ;
 * - fond blanc, bordure ≥1,5 px (--admin-border), hauteur ≥46 px,
 *   rayon 8-10 px, texte anthracite (--admin-text) ;
 * - focus : bordure bordeaux + anneau externe sans déplacement de layout ;
 * - erreur : bordure rouge + message sous le champ, jamais la couleur seule.
 */

const inputBase =
  "w-full rounded-[10px] border-[1.5px] bg-[var(--admin-surface)] px-4 py-2.5 text-[15px] text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]/60 transition-colors focus:outline-none";

const inputState = (error?: boolean, disabled?: boolean) =>
  `${inputBase} ${
    error
      ? "border-[var(--admin-danger)] focus:border-[var(--admin-danger)] focus:ring-[3px] focus:ring-[var(--admin-danger)]/20"
      : "border-[var(--admin-border)] hover:border-[var(--admin-border-strong)] focus:border-[var(--admin-burgundy)] focus:ring-[3px] focus:ring-[var(--admin-burgundy)]/20"
  } ${disabled ? "cursor-not-allowed bg-[var(--admin-surface-soft)] text-[var(--admin-text-muted)]" : ""} min-h-[46px]`;

function FieldShell({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--admin-text)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--admin-burgundy)]" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-sm text-[var(--admin-danger)]" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[var(--admin-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function AdminField({
  name,
  label,
  type = "text",
  defaultValue,
  required,
  hint,
  error,
  invalid,
  placeholder,
  disabled,
  inputMode,
  inputProps,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  hint?: string;
  /** Message d'erreur affiché sous le champ (avec icône). */
  error?: string;
  /** Marque le champ en erreur sans message (erreur globale affichée ailleurs). */
  invalid?: boolean;
  placeholder?: string;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  /** Props additionnelles passées à l'input (dir, maxLength, value/onChange…). */
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "name" | "type" | "defaultValue" | "required" | "placeholder" | "disabled" | "inputMode" | "className">;
}) {
  const hasError = !!error || !!invalid;
  return (
    <FieldShell label={label} htmlFor={name} hint={hint} error={error} required={required}>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        inputMode={inputMode}
        aria-invalid={hasError}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={inputState(hasError, disabled)}
        {...inputProps}
      />
    </FieldShell>
  );
}

export function AdminTextarea({
  name,
  label,
  defaultValue,
  required,
  hint,
  error,
  rows = 4,
  placeholder,
  invalid,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  rows?: number;
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <FieldShell label={label} htmlFor={name} hint={hint} error={error} required={required}>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={!!error || !!invalid}
        className={inputState(!!error || !!invalid)}
      />
    </FieldShell>
  );
}

export function AdminSelect({
  name,
  label,
  defaultValue,
  options,
  required,
  hint,
  error,
  invalid,
  disabled,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  error?: string;
  invalid?: boolean;
  disabled?: boolean;
}) {
  return (
    <FieldShell label={label} htmlFor={name} hint={hint} error={error} required={required}>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        aria-invalid={!!error || !!invalid}
        className={inputState(!!error || !!invalid, disabled)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function AdminCheckbox({
  name,
  label,
  description,
  defaultChecked,
  disabled,
  inputProps,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  /** Props additionnelles (ex. checked/onChange pour un usage contrôlé). */
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "defaultChecked" | "disabled" | "className">;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="mt-0.5 h-5 w-5 shrink-0 rounded-[6px] border-[1.5px] border-[var(--admin-border-strong)] accent-[var(--admin-burgundy)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-focus)]"
        {...inputProps}
      />
      <span>
        <span className="block text-sm font-medium text-[var(--admin-text)]">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-[var(--admin-text-muted)]">{description}</span>
        )}
      </span>
    </label>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-sm">
      <legend className="px-2 font-serif text-lg text-[var(--admin-text)]">{title}</legend>
      {description && (
        <p className="-mt-1 mb-4 text-xs text-[var(--admin-text-muted)]">{description}</p>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

export function InlineAlert({
  kind,
  title,
  children,
}: {
  kind: "success" | "warning" | "error" | "info";
  title: string;
  children?: React.ReactNode;
}) {
  const config: Record<string, { icon: LucideIcon; classes: string }> = {
    success: { icon: CheckCircle2, classes: "border-[var(--admin-success)]/40 bg-[var(--admin-success)]/10 text-[var(--admin-success)]" },
    warning: { icon: AlertTriangle, classes: "border-[var(--admin-warning)]/40 bg-[var(--admin-warning)]/10 text-[var(--admin-warning)]" },
    error: { icon: AlertCircle, classes: "border-[var(--admin-danger)]/40 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)]" },
    info: { icon: Info, classes: "border-[var(--admin-info)]/40 bg-[var(--admin-info)]/10 text-[var(--admin-info)]" },
  };
  const { icon: Icon, classes } = config[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-[10px] border px-4 py-3 text-sm ${classes}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">{title}</p>
        {children && <div className="mt-0.5">{children}</div>}
      </div>
    </div>
  );
}
