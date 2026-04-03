/**
 * Lightweight toast notification system.
 * No external dependencies. Mounts its own DOM container.
 * Usage: import { showToast } from "@/utils/toast"
 *        showToast("Message")
 *        showToast("Error occurred", "error")
 *        showToast("Saved!", "success")
 */

type ToastType = "success" | "error" | "info"

const COLORS: Record<ToastType, string> = {
  success: "#10b981", // emerald-500
  error:   "#ef4444", // red-500
  info:    "#6366f1", // indigo-500
}

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  info:    "i",
}

function getContainer(): HTMLElement {
  let container = document.getElementById("toast-container")
  if (!container) {
    container = document.createElement("div")
    container.id = "toast-container"
    Object.assign(container.style, {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: "99999",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      pointerEvents: "none",
    })
    document.body.appendChild(container)
  }
  return container
}

export function showToast(message: string, type: ToastType = "info", duration = 3500) {
  if (typeof window === "undefined") return

  const container = getContainer()
  const toast = document.createElement("div")
  const color = COLORS[type]

  Object.assign(toast.style, {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 18px",
    borderRadius: "14px",
    background: "rgba(13, 20, 36, 0.95)",
    border: `1px solid ${color}40`,
    color: "#e2e8f0",
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${color}20`,
    backdropFilter: "blur(12px)",
    pointerEvents: "auto",
    cursor: "pointer",
    opacity: "0",
    transform: "translateY(12px)",
    transition: "all 0.25s ease",
    maxWidth: "360px",
    minWidth: "220px",
  })

  // Icon pill
  const icon = document.createElement("span")
  Object.assign(icon.style, {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: color + "25",
    border: `1px solid ${color}50`,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "900",
    flexShrink: "0",
  })
  icon.textContent = ICONS[type]

  const text = document.createElement("span")
  text.textContent = message
  text.style.flex = "1"

  toast.appendChild(icon)
  toast.appendChild(text)
  toast.onclick = () => dismiss()
  container.appendChild(toast)

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = "1"
    toast.style.transform = "translateY(0)"
  })

  const dismiss = () => {
    toast.style.opacity = "0"
    toast.style.transform = "translateY(8px)"
    setTimeout(() => toast.remove(), 300)
  }

  const timer = setTimeout(dismiss, duration)
  toast.onclick = () => { clearTimeout(timer); dismiss() }
}
