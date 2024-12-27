/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  // eslint-disable-next-line no-unused-vars
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TableVirtuoso } from 'react-virtuoso';
import { Box, Button, Typography } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CustomScrollbar from './CustomScrollbar';
import jsPDF from 'jspdf';
import 'jspdf-autotable'

// eslint-disable-next-line react/prop-types
export default function TanstackTable({
  tableData,
  columns,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  searchText,
  handleFilterTags
}) {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const tableRef = useRef();

  const handleExportPDF = useCallback(() => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    const unit = 'pt';
    const size = 'A3';
    const orientation = 'landscape';

    const marginLeft = 20;
    const marginTop = 30;
    const rowsPerPage = 30;

    const doc = new jsPDF(orientation, unit, size);
    const pageWidth = doc.internal.pageSize.width; // Get the page width based on the size and orientation

    doc.setFontSize(12);

    const title = `Exported Data - ${(new Date()).toLocaleString('en-US', options)}`;

    const headers = columns.filter(c => !c.excludeFromReport).map(column => column.header)

    const generateTableRows = (rows) => {
      let visibleColumns = columns.filter(c => !c.excludeFromReport)
      return rows.map((row, rowIndex) => {
        let currentRow = []
        for (let i = 0; i < visibleColumns.length; i++) {
          let column = visibleColumns[i]
          if (column.accessorFn) {
            currentRow.push(column.accessorFn(row, rowIndex) || '');
          } else {
            currentRow.push(row[column.accessorKey] || '');
          }
        }
        return currentRow
      });
    };

    const addTableToPDF = (rows, startY) => {
      const tableRows = generateTableRows(rows);

      doc.autoTable({
        head: [headers],
        body: tableRows,
        startY: startY,
        margin: { left: marginLeft },
        styles: {
          cellPadding: 5,
          fontSize: 10,
          overflow: 'linebreak',
          valign: 'middle',
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        pageBreak: 'auto',
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.1,
        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            doc.addPage();
            doc.setFontSize(12);
            doc.text(title, marginLeft, 20);
          }
        },
      });
    };

    doc.text(title, marginLeft, 20);

    let currentY = marginTop;
    let pageData = [];

    for (let i = 0; i < tableData.length; i += rowsPerPage) {
      const slicedData = tableData.slice(i, i + rowsPerPage);

      if (doc.internal.pageSize.height - currentY < 10 + (slicedData.length * 15)) {
        doc.addPage();
        doc.setFontSize(12);
        doc.text(title, marginLeft, 20);
        currentY = marginTop;
      }

      pageData = slicedData;
      addTableToPDF(pageData, currentY);
      currentY = doc.lastAutoTable.finalY + 10;
    }

    doc.save(`exported_data_${(new Date()).toLocaleString('en-US', options)}.pdf`);
  }, [columns, tableData]);


  // eslint-disable-next-line no-unused-vars
  const [data, setData] = useState([]);
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onPaginationChange: setPagination,
    onSortingChange: (e) => setSorting(e),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const { rows } = table.getRowModel();

  useEffect(() => {
    setData(tableData);
  }, [tableData]);

  function exportCSV() {
    const csvContent = [];

    // Header row
    const headers = columns.filter(c => !c.excludeFromReport).map(column => column.header);
    csvContent.push(headers.join(','));

    // Data rows
    tableData.forEach((row, rowIndex) => {
      let currentRow = []
      for (let i = 0; i < columns.length; i++) {
        let column = columns[i]
        if (column.excludeFromReport) {
          continue
        }
        if (column.accessorFn) {
          currentRow.push(column.accessorFn(row, rowIndex) || '');
        } else {
          currentRow.push(row[column.accessorKey] || '');
        }
      }
      csvContent.push(currentRow.join(','));
    });

    // Join rows with newline character
    const csvString = csvContent.join('\n');

    // Create a Blob object with the CSV data
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'export.csv');

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    // eslint-disable-next-line react/prop-types
    <Box className='z-0 h-auto min-h-96 w-full min-w-96'>
      <Box className='flex h-auto min-h-96 w-full min-w-96 flex-col gap-2'>
        <div className='flex flex-row items-center justify-between'>
          <div className='pt-3 flex flex-row justify-center items-center gap-4'>
            <Button
              className='btn btn-neutral btn-sm h-11'
              onClick={() => exportCSV()}>
              Export CSV
            </Button>
            <Button
              className='btn btn-neutral btn-sm h-11'
              onClick={() => handleExportPDF()}>
              Download Pdf
            </Button>
          </div>
          <div>
            <input
              className='block border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2'
              type='text'
              name='search'
              value={searchText}
              placeholder='Search'
              onChange={(e) => {
                handleFilterTags(e.target.value);
              }}
            />
          </div>
          <div className='flex flex-row items-center justify-center gap-1 pt-3'>
            <div className='w-40'>
              <Typography className='text-xs'>Start Date</Typography>
              <DatePicker
                className='text-xs'
                value={startDate}
                onChange={(e) => setStartDate(e)}
              />
            </div>
            <div className='w-40'>
              <Typography className='text-xs'>End Date</Typography>
              <DatePicker
                className='text-xs'
                value={endDate}
                onChange={(e) => setEndDate(e)}
              />
            </div>
          </div>
        </div>
        {rows.length === 0 ? (
          <div className='flex flex-col justify-center items-center w-full h-[600px]'>
            <div>No data available</div>
          </div>
        ) : (
          <>
            <TableVirtuoso
              id='virtuoso-table'
              style={{ height: '700px', boxShadow: 'none', border: 0 }}
              totalCount={rows.length}
              components={{
                Scroller: CustomScrollbar,
                Table: ({ style, ...props }) => {
                  return (
                    <table
                      ref={tableRef}
                      className='table table-auto shadow-none'
                      {...props}
                      style={{
                        ...style,
                        width: 'calc(100vw - 600px)',
                        tableLayout: 'fixed',
                      }}
                    />
                  );
                },
                TableRow: (props) => {
                  const index = props['data-index'];
                  const row = rows[index];

                  return (
                    <tr className='border-b hover:bg-gray-100' {...props}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className='px-4 py-2'>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                },
              }}
              fixedHeaderContent={() => {
                return table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    style={{ background: 'lightgray', margin: 0 }}>
                    {headerGroup.headers.map((header, index) => {
                      return (
                        <th
                          className='bg-gray-200 px-4 py-2'
                          key={index}
                          colSpan={header.colSpan}
                          style={{
                            width: header.getSize(),
                            borderBottom: '1px solid lightgray',
                          }}>
                          {header.isPlaceholder ? null : (
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                            <div
                              {...{
                                style: header.column.getCanSort()
                                  ? { cursor: 'pointer', userSelect: 'none' }
                                  : {},
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: <ExpandMoreIcon />,
                                desc: <ExpandLessIcon />,
                              }[header.column.getIsSorted()] ?? null}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ));
              }}
            />
            <div className='flex w-full items-center justify-center gap-2'>
              <button
                className='rounded border p-1'
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}>
                {'<<'}
              </button>
              <button
                className='rounded border p-1'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}>
                {'<'}
              </button>
              <button
                className='rounded border p-1'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}>
                {'>'}
              </button>
              <button
                className='rounded border p-1'
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}>
                {'>>'}
              </button>
              <span className='flex items-center gap-1'>
                <div>Page</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </strong>
              </span>
              <span className='flex items-center gap-1'>
                | Go to page:
                <input
                  type='number'
                  defaultValue={table.getState().pagination.pageIndex + 1}
                  onChange={(e) => {
                    const page = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
                    table.setPageIndex(page);
                  }}
                  className='w-16 rounded border p-1'
                />
              </span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </Box>
    </Box>
  );
}