// import { ScanLine } from "lucide-react";

// const BarcodeScanner = () => {
//   return (
//     <div className="flex gap-3">
//       <input
//         type="text"
//         placeholder="Scan Barcode..."
//         className="flex-1 border p-3 rounded-lg"
//       />

//       <button className="bg-blue-600 text-white px-4 rounded-lg flex items-center gap-2">
//         <ScanLine size={18} />
//         Scan
//       </button>
//     </div>
//   );
// };

// export default BarcodeScanner;

// import { useRef, useState, useCallback, useEffect } from "react";
// import { ScanLine, Camera, CameraOff, X } from "lucide-react";
// import { Html5Qrcode } from "html5-qrcode";

// const BarcodeScanner = ({ products = [], onFound }) => {
//   const [value, setValue]       = useState("");
//   const [msg, setMsg]           = useState({ type: "", text: "" });
//   const [flash, setFlash]       = useState(false);
//   const [cameraOn, setCameraOn] = useState(false);
//   const [cameras, setCameras]   = useState([]);
//   const inputRef                = useRef(null);
//   const scannerRef              = useRef(null);
//   const html5QrRef              = useRef(null);

//   // ── Camera Scanner ────────────────────────────────────────────
//   const startCamera = async () => {
//     try {
//       const devices = await Html5Qrcode.getCameras();
//       if (!devices || devices.length === 0) {
//         setMsg({ type: "error", text: "Camera not found" });
//         return;
//       }
//       setCameras(devices);

//       html5QrRef.current = new Html5Qrcode("qr-reader");
//       await html5QrRef.current.start(
//         { facingMode: "environment" }, // back camera
//         { fps: 10, qrbox: { width: 250, height: 150 } },
//         (decodedText) => {
//           handleMatch(decodedText);
//         },
//         () => {} // ignore errors during scanning
//       );
//       setCameraOn(true);
//     } catch (err) {
//       setMsg({ type: "error", text: "Camera access denied. Allow camera permission." });
//     }
//   };

//   const stopCamera = async () => {
//     try {
//       if (html5QrRef.current && cameraOn) {
//         await html5QrRef.current.stop();
//         html5QrRef.current.clear();
//       }
//     } catch {}
//     setCameraOn(false);
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => { stopCamera(); };
//   }, []);

//   // ── Match product ─────────────────────────────────────────────
//   const handleMatch = useCallback((code) => {
//     if (!code?.trim()) return;

//     const product = products.find(
//       (p) =>
//         p.barcode?.toString() === code.trim() ||
//         p._id?.toString()     === code.trim() ||
//         p.sku?.toString()     === code.trim()
//     );

//     if (product) {
//       onFound?.(product);
//       setValue("");
//       setFlash(true);
//       setMsg({ type: "success", text: `✓ Added: ${product.name}` });
//       setTimeout(() => { setFlash(false); setMsg({ type: "", text: "" }); }, 1500);
//       // Stop camera after successful scan
//       stopCamera();
//     } else {
//       setMsg({ type: "error", text: `No product for barcode "${code}"` });
//       setTimeout(() => setMsg({ type: "", text: "" }), 3000);
//     }
//     inputRef.current?.focus();
//   }, [products, onFound]);

//   // ── Manual input ──────────────────────────────────────────────
//   const triggerManual = useCallback(() => {
//     handleMatch(value);
//   }, [value, handleMatch]);

//   return (
//     <div className={`rounded-xl border-2 transition-all duration-200 ${
//       flash ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"
//     }`}>

//       {/* Input row */}
//       <div className="flex items-center gap-2 px-3 py-2.5">
//         <ScanLine size={18} className={`shrink-0 ${flash ? "text-green-500" : "text-blue-500"}`} />
//         <input
//           ref={inputRef}
//           type="text"
//           value={value}
//           autoFocus
//           onChange={(e) => { setValue(e.target.value); setMsg({ type: "", text: "" }); }}
//           onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); triggerManual(); } }}
//           placeholder="Scan barcode or type code → Enter"
//           className="flex-1 py-1 outline-none text-sm bg-transparent placeholder:text-gray-400"
//         />
//         {value && (
//           <>
//             <button onClick={() => { setValue(""); inputRef.current?.focus(); }} className="text-gray-400 hover:text-gray-600">
//               <X size={14} />
//             </button>
//             <button onClick={triggerManual} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700">
//               Add
//             </button>
//           </>
//         )}

//         {/* Camera toggle button */}
//         <button
//           onClick={cameraOn ? stopCamera : startCamera}
//           className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
//             cameraOn
//               ? "bg-red-100 text-red-600 hover:bg-red-200"
//               : "bg-blue-100 text-blue-600 hover:bg-blue-200"
//           }`}
//         >
//           {cameraOn ? <><CameraOff size={14} /> Stop</> : <><Camera size={14} /> Scan</>}
//         </button>
//       </div>

//       {/* Camera viewfinder */}
//       {cameraOn && (
//         <div className="px-3 pb-3">
//           <div className="relative rounded-xl overflow-hidden border-2 border-blue-300">
//             <div id="qr-reader" className="w-full" />
//             {/* Scan guide overlay */}
//             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//               <div className="border-2 border-blue-400 rounded-lg w-52 h-28 opacity-70">
//                 <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-blue-500 rounded-tl"></div>
//                 <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-blue-500 rounded-tr"></div>
//                 <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-blue-500 rounded-bl"></div>
//                 <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-blue-500 rounded-br"></div>
//               </div>
//             </div>
//           </div>
//           <p className="text-xs text-center text-gray-400 mt-2">
//             📷 Point camera at barcode
//           </p>
//         </div>
//       )}

//       {/* Message */}
//       {msg.text && (
//         <p className={`px-4 pb-2 text-xs font-medium ${
//           msg.type === "success" ? "text-green-600" : "text-red-500"
//         }`}>
//           {msg.text}
//         </p>
//       )}
//     </div>
//   );
// };

// export default BarcodeScanner;
import { useRef, useState, useCallback, useEffect } from "react";
import { ScanLine, Camera, CameraOff, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = ({ products = [], onFound }) => {
  const [value, setValue]       = useState("");
  const [msg, setMsg]           = useState({ type: "", text: "" });
  const [flash, setFlash]       = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameras, setCameras]   = useState([]);
  const inputRef                = useRef(null);
  const html5QrRef              = useRef(null);

  const startCamera = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setMsg({ type: "error", text: "Camera not found" });
        return;
      }
      setCameras(devices);

      html5QrRef.current = new Html5Qrcode("qr-reader");
      await html5QrRef.current.start(
        { facingMode: "environment" },
        { fps: 12, qrbox: { width: 260, height: 160 } },
        (decodedText) => {
          handleMatch(decodedText);
        },
        () => {}
      );
      setCameraOn(true);
    } catch (err) {
      setMsg({ type: "error", text: "Camera access denied. Allow camera permission." });
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrRef.current && cameraOn) {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      }
    } catch {}
    setCameraOn(false);
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const handleMatch = useCallback((code) => {
    if (!code?.trim()) return;

    const product = products.find(
      (p) =>
        p.barcode?.toString() === code.trim() ||
        p._id?.toString()     === code.trim() ||
        p.sku?.toString()     === code.trim()
    );

    if (product) {
      onFound?.(product);
      setValue("");
      setFlash(true);
      setMsg({ type: "success", text: `✓ Added: ${product.name}` });
      setTimeout(() => { setFlash(false); setMsg({ type: "", text: "" }); }, 1500);
      stopCamera();
    } else {
      setMsg({ type: "error", text: `No product found for code "${code}"` });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    }
    inputRef.current?.focus();
  }, [products, onFound]);

  const triggerManual = useCallback(() => {
    handleMatch(value);
  }, [value, handleMatch]);

  return (
    <div className={`rounded-xl border transition-all duration-300 ${
      flash ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/5" : "border-slate-200 bg-slate-50/50"
    }`}>
      {/* Input Row */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm">
        <ScanLine size={18} className={`shrink-0 transition-colors ${flash ? "text-emerald-500" : "text-blue-600"}`} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus
          onChange={(e) => { setValue(e.target.value); setMsg({ type: "", text: "" }); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); triggerManual(); } }}
          placeholder="Scan barcode or type code here..."
          className="flex-1 py-1 outline-none text-sm bg-transparent text-slate-700 placeholder:text-slate-400 font-medium"
        />
        {value && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => { setValue(""); inputRef.current?.focus(); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
              <X size={14} />
            </button>
            <button onClick={triggerManual} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition">
              Add
            </button>
          </div>
        )}

        <button
          onClick={cameraOn ? stopCamera : startCamera}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            cameraOn
              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/50"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/50"
          }`}
        >
          {cameraOn ? <><CameraOff size={14} /> Stop</> : <><Camera size={14} /> Scan</>}
        </button>
      </div>

      {/* Camera Viewfinder */}
      {cameraOn && (
        <div className="px-3 pb-3 pt-2">
          <div className="relative rounded-xl overflow-hidden border border-blue-200 bg-black shadow-inner">
            <div id="qr-reader" className="w-full mx-auto overflow-hidden" />
            {/* Scan overlay frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border border-white/30 rounded-xl w-56 h-32 relative shadow-[0_0_0_400px_rgba(0,0,0,0.4)]">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                <div className="absolute inset-x-0 top-1/2 h-[2px] bg-blue-500/80 animate-pulse shadow-[0_0_8px_#3b82f6]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {msg.text && (
        <div className={`px-4 pb-2.5 text-xs font-semibold ${msg.type === "success" ? "text-emerald-600" : "text-rose-500"}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;