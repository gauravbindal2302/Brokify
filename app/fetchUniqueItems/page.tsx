'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';

type Item = {
  'Item Name': string;
  'Quantity': string | number;
};

export default function CSVUploader() {
  const [data, setData] = useState<Item[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [rates, setRates] = useState<{ [key: number]: number }>({});
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    Papa.parse<Item>(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rawData = result.data;
        setRawRows(rawData);

        const aggregationMap = new Map<string, number>();
        rawData.forEach((item) => {
          const name = item['Item Name']?.trim();
          const qty = Number(item['Quantity']) || 0;
          if (name) {
            aggregationMap.set(name, (aggregationMap.get(name) || 0) + qty);
          }
        });

        const aggregatedData = Array.from(aggregationMap, ([name, totalQty]) => ({
          'Item Name': name,
          'Quantity': totalQty,
        }));

        setData(aggregatedData);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });
  };

  const handleRateChange = (index: number, value: string) => {
    const newRate = Number(value);
    if (!isNaN(newRate)) {
      setRates((prevRates) => ({
        ...prevRates,
        [index]: newRate,
      }));
    }
  };

  const toggleItemExpansion = (itemName: string) => {
    setExpandedItems((prev) => {
      const newExpandedItems = new Set(prev);
      if (newExpandedItems.has(itemName)) {
        newExpandedItems.delete(itemName);
      } else {
        newExpandedItems.add(itemName);
      }
      return newExpandedItems;
    });
  };

  const sum_of_quantity = data.reduce(
    (acc, item) => acc + Number(item['Quantity']),
    0
  );

  const total_amount = data.reduce((acc, item, index) => {
    const quantity = Number(item['Quantity']);
    const rate = rates[index] || 0;
    return acc + quantity * rate;
  }, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white min-h-screen">
      {!file ? (
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="w-full border border-gray-500 text-gray-500 rounded px-4 py-2 cursor-pointer"
        />
      ) : (
        <div className="overflow-auto">
          <button
            onClick={() => {
              window.print();
            }}
            className="print-btn mb-8 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print
          </button>
          {file && (
            <div className="mb-4 text-sm text-gray-700 font-bold">
              <span className="font-bold-500">
                {file.name
                  .replace(/\.csv$/i, '')
                  .replace(/From\s*-\s*/i, 'From ')
                  .replace(/To\s*-\s*/i, 'To ')}
              </span>
            </div>
          )}

          <table className="mt-8 min-w-full border border-gray-300 text-xs lg:text-sm text-center text-black">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="px-3 py-2 border border-gray-300 w-[10%]">S.No.</th>
                <th className="px-3 py-2 border border-gray-300 w-[55%]">Item Name</th>
                <th className="px-3 py-2 border border-gray-300 w-[30%]">Item Quantity</th>
                <th className="px-3 py-2 border border-gray-300 w-[5%]" />
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <React.Fragment key={index}>
                  <tr className="even:bg-gray-50 text-left">
                    <td className="px-3 py-2 border border-gray-300">{index + 1}</td>
                    <td className="px-3 py-2 border border-gray-300">
                      <button
                        className="cursor-pointer text-left"
                        onClick={() => toggleItemExpansion(row['Item Name'])}
                      >
                        {row['Item Name']}
                      </button>
                    </td>
                    <td className="px-3 py-2 border border-gray-300">{row['Quantity']}</td>
                    <td className="px-3 py-2 border border-gray-300">
                      <input
                        type="number"
                        min="0"
                        value={rates[index] || ''}
                        onChange={(e) => handleRateChange(index, e.target.value)}
                        className="bg-gray-100 max-w-[40px] px-2 rounded focus-none outline-none"
                        placeholder="?"
                      />
                    </td>
                  </tr>

                  {expandedItems.has(row['Item Name']) && (
                    <tr>
                      <td colSpan={4} className="px-3 py-2 border border-gray-300">
                        <table className="w-full text-xs lg:text-sm border border-gray-300">
                          <thead className="bg-gray-300">
                            <tr>
                              {/*<th className="border px-3 py-2">S.No.</th>*/}
                              <th className="border px-3 py-2">Date</th>
                              <th className="border px-3 py-2">Sold To</th>
                              <th className="border px-3 py-2">City ST</th>
                              <th className="border px-3 py-2">Quantity</th>
                              <th className="border px-3 py-2">Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rawRows
                              .filter((rowData) => rowData['Item Name']?.trim() === row['Item Name'])
                              .map((rowData, idx) => (
                                <tr key={idx}>
                                  {/*<td className="border px-3 py-2">{idx + 1}</td>*/}
                                  <td className="border px-3 py-2">{rowData['Date']}</td>
                                  <td className="border px-3 py-2">{rowData['Sold To']}</td>
                                  <td className="border px-3 py-2">{rowData['City ST']}</td>
                                  <td className="border px-3 py-2">{rowData['Quantity']}</td>
                                  <td className="border px-3 py-2">{rowData['Rate']}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex">
            <div className="w-full flex justify-between text-sm font-semibold bg-[#004aad] text-white">
              <span className="w-[65%] px-3 py-2">Total (No.)</span>
              <span className="w-[40%] px-3 py-2">{sum_of_quantity}</span>
            </div>
          </div>
          <div className="mt-4 flex">
            <div className="w-full flex justify-between text-sm font-semibold bg-[#ff9a08] text-black">
              <div className="w-[65%] px-3 py-2">Total (Rs)</div>
              <div className="w-[40%] px-3 py-2">₹{total_amount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
