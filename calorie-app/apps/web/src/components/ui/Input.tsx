import React from "react";
type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: Props) {
const base = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none";
return <input {...props} className={[base, className].join(" ")} />;
}