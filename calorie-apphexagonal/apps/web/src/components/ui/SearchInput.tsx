import { useEffect, useId, useState } from "react";

type Props = {
value: string;
onChange: (v: string) => void;
delay?: number;
placeholder?: string;
label?: string;
leftIcon?: React.ReactNode;
rightIcon?: React.ReactNode;
className?: string;
inputClassName?: string;
};

export default function SearchInput({
value,
onChange,
delay = 300,
placeholder = "Buscar...",
label,
leftIcon,
rightIcon,
className = "",
inputClassName = "",
}: Props) {
const [v, setV] = useState(value);
const id = useId();

useEffect(() => setV(value), [value]);

useEffect(() => {
const t = setTimeout(() => onChange(v), delay);
return () => clearTimeout(t);
}, [v, delay, onChange]);

return (
<label htmlFor={id} className={["block", className].join(" ")}>
{label ? (
<span className="mb-1 block text-sm text-gray-700">{label}</span>
) : null}

  <div className="relative flex items-center">
    {leftIcon ? (
      <span className="pointer-events-none absolute left-2 inline-flex items-center text-gray-400">
        {leftIcon}
      </span>
    ) : null}

    <input
      id={id}
      value={v}
      onChange={(e) => setV(e.target.value)}
      placeholder={placeholder}
      className={[
        "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none",
        leftIcon ? "pl-8" : "",
        rightIcon ? "pr-8" : "",
        inputClassName,
      ].join(" ")}
    />

    {rightIcon ? (
      <span className="absolute right-2 inline-flex items-center text-gray-400">
        {rightIcon}
      </span>
    ) : null}
  </div>
</label>
);
}