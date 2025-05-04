
import React from "react";

type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  striped?: boolean;
  hoverable?: boolean;
};

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped, hoverable, ...props }, ref) => {
    const tableClass = `table ${striped ? "table-striped" : ""} ${hoverable ? "table-hover" : ""} ${className || ""}`;

    return (
      <div className="table-container">
        <table ref={ref} className={tableClass} {...props} />
      </div>
    );
  }
);

Table.displayName = "Table";

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return <thead ref={ref} className={className} {...props} />;
  }
);

TableHeader.displayName = "TableHeader";

type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return <tbody ref={ref} className={className} {...props} />;
  }
);

TableBody.displayName = "TableBody";

type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => {
    return <tfoot ref={ref} className={`table-footer ${className || ""}`} {...props} />;
  }
);

TableFooter.displayName = "TableFooter";

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return <tr ref={ref} className={className} {...props} />;
  }
);

TableRow.displayName = "TableRow";

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => {
    return <th ref={ref} className={className} {...props} />;
  }
);

TableHead.displayName = "TableHead";

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return <td ref={ref} className={className} {...props} />;
  }
);

TableCell.displayName = "TableCell";

type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>;

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => {
    return <caption ref={ref} className={`table-caption ${className || ""}`} {...props} />;
  }
);

TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
