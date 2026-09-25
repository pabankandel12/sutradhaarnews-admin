"use client";

import { FormEvent, ReactNode } from "react";

type SelectOption = { value: string; label: string };

type DialogField =
  | {
      type: "text" | "textarea";
      label: string;
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
      required?: boolean;
    }
  | {
      type: "select";
      label: string;
      value: string;
      onChange: (value: string) => void;
      options: SelectOption[];
    };

export function AdminDialog({
  open,
  title,
  submitLabel,
  fields,
  children,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  submitLabel: string;
  fields: DialogField[];
  children?: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.52)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
        padding: 20,
      }}
      onClick={onClose}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          width: "min(560px, 100%)",
          background: "#111827",
          color: "#e5e7eb",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.32)",
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 24 }}>{title}</h3>

        <div style={{ display: "grid", gap: 14 }}>
          {fields.map((field) => {
            if (field.type === "select") {
              return (
                <label key={field.label} style={{ display: "grid", gap: 6 }}>
                  <span>{field.label}</span>
                  <select
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #374151", background: "#0f172a", color: "#fff" }}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <label key={field.label} style={{ display: "grid", gap: 6 }}>
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #374151", background: "#0f172a", color: "#fff", resize: "vertical" }}
                    required={field.required}
                  />
                ) : (
                  <input
                    type="text"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #374151", background: "#0f172a", color: "#fff" }}
                  />
                )}
              </label>
            );
          })}
        </div>

        {children}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button type="button" onClick={onClose} style={{ background: "#374151", color: "#fff", border: 0, borderRadius: 999, padding: "10px 18px", cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" style={{ background: "#60a5fa", color: "#0f172a", border: 0, borderRadius: 999, padding: "10px 18px", cursor: "pointer", fontWeight: 700 }}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
