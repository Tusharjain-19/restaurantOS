import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { db, type Bill, type RestaurantProfile } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Printer } from 'lucide-react';

interface Props {
  bill: Bill | null;
  restaurant: RestaurantProfile | undefined;
  onClose: () => void;
}

export function ThermalReceipt({ bill, restaurant, onClose }: Props) {
  const printers = useLiveQuery(() => db.printers.toArray());
  const billPrinter = printers?.find(p => p.type === 'bill' && p.is_default) || printers?.find(p => p.type === 'bill');
  const paperWidth = billPrinter?.paper_width || '80mm';
  
  const is58 = paperWidth === '57mm';
  const rawWidth = is58 ? '57mm' : '80mm';
  const innerWidth = is58 ? '53mm' : '76mm';
  const wrapperWidth = is58 ? '61mm' : '84mm';
  const outputScreen = is58 ? '57mm' : '80mm';

  useEffect(() => {
    if (bill) {
      const timer = setTimeout(() => {
        window.print();
        // Give time for print dialog before closing
        setTimeout(onClose, 1000);
      }, 2000); // Animation duration before print
      return () => clearTimeout(timer);
    }
  }, [bill, onClose]);

  if (!bill) return null;

  return (
    <>
      <style>
        {`
          @media print {
            @page { 
              size: ${rawWidth} auto; 
              margin: 0; 
            }
            html, body {
              width: ${rawWidth};
              margin: 0;
              padding: 0;
              background: white !important;
            }
            #root { 
              display: none !important; 
            }
            #printable-receipt { 
              display: block !important;
              width: ${innerWidth};
              padding: 2mm 0; 
              margin: 0 auto;
            }
          }
          
          @keyframes slideDownBill {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(0); }
          }
          
          .animate-bill-print {
            animation: slideDownBill 1.8s ease-out forwards;
          }
        `}
      </style>

      {/* Screen Animation Overlay */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 print:hidden backdrop-blur-sm">
        <div className="flex flex-col items-center">
            {/* Virtual Printer Slot */}
            <div style={{ width: wrapperWidth }} className="h-8 bg-slate-800 rounded-t-xl shadow-[inset_0_-4px_8px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center border-b-4 border-slate-950 relative">
                <Printer className="text-slate-400 h-4 w-4" />
                <div style={{ width: innerWidth }} className="absolute bottom-0 h-1 bg-black rounded-b-sm"></div>
            </div>
            
            {/* Paper Output Area */}
            <div style={{ width: outputScreen }} className="h-[400px] relative overflow-hidden bg-transparent z-10 flex justify-center">
                <div className="absolute top-0 w-full animate-bill-print bg-white text-black p-4 text-[11px] font-mono shadow-2xl pt-2 pb-8 border-b border-gray-200">
                    <ReceiptContent bill={bill} restaurant={restaurant} is58={is58} />
                </div>
            </div>
            
            <p className="text-white mt-8 font-medium animate-pulse text-sm">Printing Receipt...</p>
        </div>
      </div>

      {/* Invisible Printable Form Rendered at Top Level */}
      {createPortal(
        <div className="hidden print:block text-black bg-white mx-auto" id="printable-receipt">
          <ReceiptContent bill={bill} restaurant={restaurant} is58={is58} />
        </div>,
        document.body
      )}
    </>
  );
}

function ReceiptContent({ bill, restaurant, is58 }: { bill: Bill, restaurant?: RestaurantProfile, is58: boolean }) {
  return (
    <div className={`font-mono leading-tight text-black mx-auto bg-white pt-2 pb-6 ${is58 ? 'text-[9px] max-w-[54mm]' : 'text-[11px] max-w-[76mm]'}`}>
      <div className="text-center mb-4">
        <h1 className={`${is58 ? 'text-lg' : 'text-2xl'} font-extrabold uppercase mb-1`}>{restaurant?.name || 'RestaurantOS'}</h1>
        <p className={`${is58 ? 'text-[9px]' : 'text-[10px]'} break-words uppercase`}>{restaurant?.address || '123 Food Street, City'}</p>
        <p className={`${is58 ? 'text-[9px]' : 'text-[10px]'} mt-0.5 uppercase`}>Phone: {restaurant?.phone || '+91 9999999999'}</p>
        {restaurant?.gstin && <p className="text-[10px]">GSTIN: {restaurant.gstin}</p>}
        {restaurant?.fssai_license && <p className="text-[10px] uppercase">FSSAI: {restaurant.fssai_license}</p>}
      </div>

      <div className="border-t-[1.5px] border-b-[1.5px] border-dashed border-black py-2 my-2 text-[11px] grid grid-cols-2 gap-y-1">
        <div>Bill: <span className="font-bold">{bill.bill_number}</span></div>
        <div className="text-right">{new Date(bill.created_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
        <div>Table: {bill.table_number || '-'}</div>
        <div className="text-right font-bold uppercase">{bill.order_type.replace('_', ' ')}</div>
      </div>

      <div className="border-b-[1.5px] border-dashed border-black py-2 mb-2">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left font-bold pb-1 uppercase w-3/5">Item</th>
              <th className="text-center font-bold pb-1 uppercase w-1/5">Qty</th>
              <th className="text-right font-bold pb-1 uppercase w-1/5">Amt</th>
            </tr>
          </thead>
          <tbody>
            {(bill.items as any[]).map((item, idx) => (
              <tr key={idx} className="align-top">
                <td className="py-1.5 pr-2">
                  <div className="font-medium">{item.name}</div>
                  {item.variant && <div className="text-[10px] font-normal leading-none pt-0.5">[{item.variant}]</div>}
                  {item.special_instructions && <div className="text-[10px] italic leading-none pt-0.5">*{item.special_instructions}</div>}
                </td>
                <td className="py-1.5 text-center font-medium">{item.quantity}</td>
                <td className="py-1.5 text-right font-medium">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] space-y-1 mb-2">
        <div className="flex justify-between"><span>Subtotal</span><span>{bill.subtotal.toFixed(2)}</span></div>
        {bill.discount_amount > 0 && <div className="flex justify-between font-bold"><span>Discount</span><span>-{bill.discount_amount.toFixed(2)}</span></div>}
        <div className="flex justify-between"><span>CGST @ 2.5%</span><span>{bill.cgst.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>SGST @ 2.5%</span><span>{bill.sgst.toFixed(2)}</span></div>
        {bill.packaging_charge > 0 && <div className="flex justify-between"><span>Packaging</span><span>{bill.packaging_charge.toFixed(2)}</span></div>}
      </div>

      <div className="border-t-[1.5px] border-b-[1.5px] border-dashed border-black py-2 my-2">
        <div className="flex justify-between text-[14px] font-extrabold uppercase">
          <span>Grand Total</span>
          <span>Rs {bill.grand_total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-[11px] space-y-1 mb-4 flex justify-between uppercase">
        <span>Payment ({bill.payment_method})</span>
        <span className="font-bold">Rs {bill.grand_total.toFixed(2)}</span>
      </div>

      <div className="text-center text-[11px] space-y-1 pt-1 opacity-90">
        <p className="font-extrabold uppercase">Thank You, Visit Again!</p>
        <p>- Powered by RestaurantOS -</p>
      </div>
    </div>
  );
}
