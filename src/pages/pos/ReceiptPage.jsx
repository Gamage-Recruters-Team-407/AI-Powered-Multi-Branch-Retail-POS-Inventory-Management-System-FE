// import { useLocation, useNavigate } from "react-router-dom";
// import { ArrowLeft, CheckCircle } from "lucide-react";
// import ReceiptPreview from "../../components/pos/ReceiptPreview";

// const ReceiptPage = () => {
//   const navigate  = useNavigate();
//   const { state } = useLocation();
//   const sale      = state?.sale;

//   if (!sale) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-500 mb-4">No receipt data available.</p>
//           <button
//             onClick={() => navigate("/pos")}
//             className="bg-blue-600 text-white px-5 py-2 rounded-lg"
//           >
//             Back to POS
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
//       {/* Success banner */}
//       <div className="flex items-center gap-2 text-green-600 font-semibold mb-6 print:hidden">
//         <CheckCircle size={22} />
//         Sale Completed Successfully!
//       </div>

//       {/* Receipt */}
//       <ReceiptPreview sale={sale} />

//       {/* Back button */}
//       <button
//         onClick={() => navigate("/pos")}
//         className="mt-5 flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 font-medium print:hidden"
//       >
//         <ArrowLeft size={16} /> New Sale
//       </button>
//     </div>
//   );
// };

// export default ReceiptPage;
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, FileText } from "lucide-react";
import ReceiptPreview from "../../components/pos/ReceiptPreview";

const ReceiptPage = ({ sale: saleProp, onNewSale }) => {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const sale = saleProp || state?.sale;

  if (!sale) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-md border max-w-sm w-full">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
            <FileText size={24} />
          </div>
          <p className="text-slate-600 font-medium mb-5">No receipt data available.</p>
          <button
            onClick={() => onNewSale ? onNewSale() : navigate("/pos")}
            className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Back to POS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-12 px-4 antialiased">
     
      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-xl font-bold mb-8 shadow-sm print:hidden animate-fade-in text-sm">
        <CheckCircle size={20} className="text-emerald-500" />
        Sale Completed Successfully!
      </div>

      
      <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200 max-w-md w-full print:p-0 print:shadow-none print:border-none">
        <ReceiptPreview sale={sale} />
      </div>

      
      <button
        onClick={() => onNewSale ? onNewSale() : navigate("/pos")}
        className="mt-6 flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-900 px-6 py-3 rounded-xl font-semibold transition-all shadow-md shadow-slate-900/10 print:hidden text-sm"
      >
        <ArrowLeft size={16} /> Start New Sale
      </button>
    </div>
  );
};

export default ReceiptPage;