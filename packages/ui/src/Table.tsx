import * as React from "react";
import { cn } from "./cn";

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="relative w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);

export const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("border-b border-white/[0.08]", className)} {...props} />
);

export const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("divide-y divide-white/[0.06]", className)} {...props} />
);

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("transition-colors hover:bg-white/[0.03]", className)} {...props} />
);

export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("h-10 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55", className)} {...props} />
);

export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("p-4 align-middle text-white/85 text-sm", className)} {...props} />
);
