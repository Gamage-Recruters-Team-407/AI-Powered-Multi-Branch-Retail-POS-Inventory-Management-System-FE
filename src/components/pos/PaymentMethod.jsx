// const PaymentMethod = ({
//   selected,
//   setSelected,
// }) => {
//   return (
//     <div className="space-y-3">
//       {["Cash", "Card", "QR"].map((method) => (
//         <label
//           key={method}
//           className="flex items-center gap-2"
//         >
//           <input
//             type="radio"
//             checked={selected === method}
//             onChange={() =>
//               setSelected(method)
//             }
//           />

//           {method}
//         </label>
//       ))}
//     </div>
//   );
// };

// export default PaymentMethod;

// import { Banknote, CreditCard, QrCode } from "lucide-react";

// const METHODS = [
//   { id: "CASH", label: "Cash",       icon: Banknote,    hint: "Physical cash payment" },
//   { id: "CARD", label: "Card",       icon: CreditCard,  hint: "Swipe / tap card" },
//   { id: "QR",   label: "QR / Online",icon: QrCode,      hint: "Scan QR to pay" },
// ];


// const PaymentMethod = ({ selected, setSelected }) => {
//   return (
//     <div className="grid grid-cols-3 gap-3">
//       {METHODS.map(({ id, label, icon: Icon, hint }) => (
//         <button
//           key={id}
//           type="button"
//           onClick={() => setSelected(id)}
//           title={hint}
//           className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition text-sm font-medium ${
//             selected === id
//               ? "border-blue-600 bg-blue-50 text-blue-700"
//               : "border-gray-200 hover:border-blue-300 text-gray-600 bg-white"
//           }`}
//         >
//           <Icon size={22} />
//           {label}
//         </button>
//       ))}
//     </div>
//   );
// };

// export default PaymentMethod;

import { Banknote, CreditCard, QrCode } from "lucide-react";

const METHODS = [
  { id: "CASH", label: "Cash",        icon: Banknote,   hint: "Physical cash payment" },
  { id: "CARD", label: "Card",        icon: CreditCard, hint: "Swipe / tap card" },
  { id: "QR",   label: "QR / Online", icon: QrCode,     hint: "Scan QR to pay" },
];

const PaymentMethod = ({ selected, setSelected }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {METHODS.map(({ id, label, icon: Icon, hint }) => (
        <button
          key={id}
          type="button"
          onClick={() => setSelected(id)}
          title={hint}
          className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border-2 transition-all duration-200 text-xs font-bold ${
            selected === id
              ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm shadow-blue-500/5"
              : "border-slate-200/80 hover:border-slate-300 text-slate-600 bg-white"
          }`}
        >
          <Icon size={20} className={selected === id ? "text-blue-600" : "text-slate-400"} />
          {label}
        </button>
      ))}
    </div>
  );
};

export default PaymentMethod;