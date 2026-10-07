import { QRCodeSVG } from "qrcode.react";

interface RestaurantQrCardProps {
  restaurantName: string;
  logo: string;
  tableNumber: string;
  url: string;
  size: number;
  qrId: string;
}

function RestaurantQrCard({
  restaurantName,
  logo,
  tableNumber,
  url,
  size,
  qrId,
}: RestaurantQrCardProps) {
  return (
    <article className="relative mx-auto w-full max-w-[330px] overflow-hidden rounded-[28px] border border-[#d8cfb9] bg-[#fbf9f2] px-5 pb-6 pt-5 text-center shadow-[0_16px_44px_rgba(23,59,50,0.12)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[#b28a50]" />
      <div className="flex min-h-12 items-center justify-center gap-3">
        {logo ? (
          <img src={logo} alt="" className="h-11 w-11 rounded-full border border-[#d8cfb9] object-cover" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b28a50] font-serif text-xl text-[#173b32]">{restaurantName.charAt(0)}</span>
        )}
        <h3 className="max-w-[230px] text-left font-serif text-lg font-bold leading-tight text-[#173b32]">{restaurantName}</h3>
      </div>
      <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.24em] text-[#9b7540]">A seat at our table</p>
      <h4 className="mt-1 font-serif text-3xl font-semibold text-[#173b32]">Table {tableNumber}</h4>
      <div className="my-3 flex items-center justify-center gap-2 text-[#b28a50]">
        <span className="h-px w-12 bg-[#d8cfb9]" /><span className="text-xs">✦</span><span className="h-px w-12 bg-[#d8cfb9]" />
      </div>
      <div className="mx-auto w-fit rounded-2xl border border-[#e4ddcd] bg-white p-2.5 shadow-sm">
        <QRCodeSVG
          id={qrId}
          value={url}
          size={size}
          level="H"
          includeMargin
          fgColor="#173b32"
          bgColor="#ffffff"
          title={`${restaurantName} menu for table ${tableNumber}`}
        />
      </div>
      <p className="mt-4 text-xs font-extrabold tracking-[0.2em] text-[#173b32]">SCAN TO ORDER</p>
      <p className="mt-1 font-serif text-sm italic text-slate-500">Good food is just a scan away.</p>
      <p className="mt-4 break-all rounded-lg border border-[#e5dece] bg-[#f5f1e7] px-3 py-2 text-[9px] leading-4 text-slate-500">{url}</p>
      <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.18em] text-[#9b7540]">Freshly made · Thoughtfully served</p>
    </article>
  );
}

export default RestaurantQrCard;
