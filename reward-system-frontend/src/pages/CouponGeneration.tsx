import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { MdArrowBack, MdContentCopy, MdPictureAsPdf, MdHistory, MdFileDownload } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";

type Step = "form" | "preview" | "export";

interface GeneratedCoupon {
  id: string;
  code: string;
  points: number;
  title: string;
}

const CouponGeneration = () => {
  const [step, setStep] = useState<Step>("form");
  const [tierValue, setTierValue] = useState<number>(500);
  const [quantity, setQuantity] = useState<number>(100);
  const [title, setTitle] = useState<string>("Bulk Coupon Generation");
  const [generatedCoupons, setGeneratedCoupons] = useState<GeneratedCoupon[]>([]);
  const [batchId, setBatchId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const totalValue = tierValue * quantity;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        "http://127.0.0.1:3000/coupons/generate",
        {
          title,
          points: tierValue,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 201) {
        setGeneratedCoupons(res.data);
        // Generate a mock batch ID from the first coupon or timestamp
        setBatchId(`#B${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
        setStep("preview");
        Swal.fire({
          title: "Success!!",
          text: `${quantity} Coupons Generated Successfully`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("GENERATION ERROR", error);
      let errorMessage = "Failed to generate coupons";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    Swal.fire({
      title: "Copied!",
      text: "Coupon code copied to clipboard",
      icon: "success",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const handleConfirm = () => {
    setStep("export");
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 overflow-auto flex flex-col">
        <Header title="Coupon Generation" />

        <div className="p-8 max-w-4xl mx-auto w-full">
          {/* Back Button */}
          <button 
            onClick={() => {
              if (step === "preview") setStep("form");
              if (step === "export") setStep("preview");
            }}
            className={`flex items-center gap-2 text-gray-500 hover:text-[#1E2633] mb-6 transition-colors ${step === "form" ? "invisible" : ""}`}
          >
            <MdArrowBack />
            <span className="text-sm font-bold">
              {step === "preview" ? "Generate Coupons" : "Coupon Batch Preview"}
            </span>
          </button>

          {/* Step 1: Form */}
          {step === "form" && (
            <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 space-y-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-[#1E2633]">Generate Coupons</h2>
                <p className="text-gray-400 text-sm">Define the parameters for your new potential coupon batch. Values are calculated instantly.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BATCH TITLE</label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Batch Title (e.g. Summer Promo)"
                    className="w-full bg-[#F8F9FA] border-none rounded-2xl px-6 py-4 text-[#1E2633] font-medium focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">COUPON TIER VALUE</label>
                  <select 
                    value={tierValue}
                    onChange={(e) => setTierValue(Number(e.target.value))}
                    className="w-full bg-[#F8F9FA] border-none rounded-2xl px-6 py-4 text-[#1E2633] font-medium focus:ring-2 focus:ring-primary outline-none appearance-none"
                  >
                    <option value={500}>Select Value: 500 Pts</option>
                    <option value={1000}>Select Value: 1000 Pts</option>
                    <option value={2000}>Select Value: 2000 Pts</option>
                    <option value={5000}>Select Value: 5000 Pts</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NUMBER OF COUPONS</label>
                  <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="Enter Quantity"
                    className="w-full bg-[#F8F9FA] border-none rounded-2xl px-6 py-4 text-[#1E2633] font-medium focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOTAL VALUE OF THE BATCH</p>
                  <p className="text-4xl font-black text-[#1E2633] mt-2">{totalValue.toLocaleString()} <span className="text-xl font-bold text-gray-400 uppercase">PTS</span></p>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={loading || !title || quantity <= 0}
                  className="bg-primary hover:bg-[#D9541E] text-white px-10 py-4 rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate Batch"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === "preview" && (
            <div className="space-y-8">
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                 <div className="absolute left-0 top-0 w-2 h-full bg-primary opacity-20"></div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NO. OF COUPONS</p>
                    <p className="text-5xl font-black text-[#1E2633]">{quantity}</p>
                    <p className="text-sm font-bold text-gray-500">Coupons Generated</p>
                 </div>
                 <div className="bg-orange-50 text-primary px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
                    <span className="text-xl">🎫</span>
                    Value: {tierValue} Pts each
                 </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                <h3 className="text-lg font-bold text-[#1E2633]">List Preview</h3>
                <div className="space-y-3 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                  {generatedCoupons.map((coupon, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl group hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 text-lg shadow-sm">
                          🎫
                        </div>
                        <div>
                          <p className="text-md font-bold text-[#1E2633] tracking-wider">{coupon.code}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Points: {coupon.points} Pts</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCopy(coupon.code)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <MdContentCopy />
                      </button>
                    </div>
                  ))}
                  {generatedCoupons.length < quantity && (
                    <div className="text-center py-4 text-gray-400 text-sm italic">
                      Showing list preview of generated coupons...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button 
                  onClick={() => setStep("form")}
                  className="text-gray-400 font-bold hover:text-[#1E2633] transition-colors"
                >
                  Cancel/Secure
                </button>
                <button 
                  onClick={handleConfirm}
                  className="bg-primary hover:bg-[#D9541E] text-white px-12 py-4 rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/20"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Export */}
          {step === "export" && (
            <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 space-y-10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold text-[#1E2633]">Export Coupon Batch</h2>
                </div>
                <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-3xl opacity-20">
                  🎫
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-8 gap-x-12 pb-10 border-b border-gray-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BATCH ID</p>
                  <p className="text-lg font-bold text-[#1E2633]">{batchId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GENERATED AT</p>
                  <p className="text-lg font-bold text-[#1E2633]">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOTAL COUPONS</p>
                  <p className="text-lg font-bold text-[#1E2633]">{quantity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOTAL VALUE</p>
                  <p className="text-2xl font-black text-primary">{totalValue.toLocaleString()} <span className="text-sm font-bold">Pts</span></p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SELECT EXPORT FORMAT</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-between p-6 bg-white border-2 border-primary rounded-2xl text-primary font-bold text-left">
                    <div className="flex items-center gap-3">
                      <MdPictureAsPdf className="text-2xl" />
                      <span>PDF (Print Ready)</span>
                    </div>
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-[10px]">
                      ✓
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-6 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 font-bold hover:border-gray-200 transition-all text-left">
                    <MdHistory className="text-2xl" />
                    <span>Transaction History</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6 pt-4 text-center">
                <button 
                  onClick={() => {
                    Swal.fire({
                      title: "Downloading...",
                      text: "Your coupon batch is being prepared for download",
                      icon: "info",
                      timer: 2000,
                      showConfirmButton: false
                    });
                  }}
                  className="w-full bg-primary hover:bg-[#D9541E] text-white py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20"
                >
                  <MdFileDownload className="text-2xl" />
                  Download
                </button>
                <button 
                  onClick={() => setStep("form")}
                  className="text-gray-400 font-bold hover:text-[#1E2633] transition-colors"
                >
                  Back to Generation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponGeneration;
