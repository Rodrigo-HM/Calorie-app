type Variant = "primary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

export default function Button({
className = "",
variant = "primary",
size = "md",
...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
const base = "inline-flex items-center justify-center rounded-md font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
primary: "bg-gray-900 text-white hover:bg-black",
ghost: "bg-white text-gray-800 hover:bg-gray-50",
outline: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
danger: "bg-rose-600 text-white hover:bg-rose-700",
};
const sizes: Record<Size, string> = {
sm: "px-2.5 py-1.5 text-xs",
md: "px-3 py-2 text-sm",
lg: "px-4 py-2.5 text-base",
};
return (
<button
{...props}
className={[base, variants[variant], sizes[size], className].join(" ")}
/>
);
}