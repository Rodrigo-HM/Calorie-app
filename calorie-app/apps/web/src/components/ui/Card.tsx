import React from "react";
export default function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
return <div className={["rounded-xl border border-gray-200 bg-white p-6 shadow-sm", className].join(" ")}>{children}</div>;
}
export const CardHeader = ({ className = "", ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p} className={["mb-3 border-b border-gray-100 pb-2", className].join(" ")} />;
export const CardTitle = ({ className = "", ...p }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...p} className={["text-base font-semibold text-gray-900", className].join(" ")} />;
export const CardContent = ({ className = "", ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p} className={className} />;
export const CardFooter = ({ className = "", ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p} className={["mt-3 flex justify-end gap-2", className].join(" ")} />;