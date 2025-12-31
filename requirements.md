## Packages
framer-motion | Smooth animations for result cards and alerts
clsx | Utility for conditional class names (standard in shadcn)
tailwind-merge | Utility for merging tailwind classes (standard in shadcn)

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["Inter", "sans-serif"],
  display: ["Space Grotesk", "sans-serif"],
}
API expects POST /api/analyze with { prescriptions: string[], allergies: string[] }
