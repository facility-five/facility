import * as React from "react";
import { cn } from "@/lib/utils";

const ManagerTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
ManagerTable.displayName = "ManagerTable";

const ManagerTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "bg-gradient-to-r from-purple-600 to-purple-700 [&_tr]:border-0", 
      className
    )} 
    {...props} 
  />
));
ManagerTableHeader.displayName = "ManagerTableHeader";

const ManagerTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "bg-white [&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-gray-100", 
      className
    )}
    {...props}
  />
));
ManagerTableBody.displayName = "ManagerTableBody";

const ManagerTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors data-[state=selected]:bg-gray-50",
      className,
    )}
    {...props}
  />
));
ManagerTableRow.displayName = "ManagerTableRow";

const ManagerTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-semibold text-white [&:has([role=checkbox])]:pr-0 first:rounded-tl-lg last:rounded-tr-lg",
      className,
    )}
    {...props}
  />
));
ManagerTableHead.displayName = "ManagerTableHead";

const ManagerTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0 text-gray-700", 
      className
    )}
    {...props}
  />
));
ManagerTableCell.displayName = "ManagerTableCell";

export {
  ManagerTable,
  ManagerTableHeader,
  ManagerTableBody,
  ManagerTableHead,
  ManagerTableRow,
  ManagerTableCell,
};