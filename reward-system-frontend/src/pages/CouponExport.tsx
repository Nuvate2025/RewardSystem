import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { BiDownload } from "react-icons/bi";
import { MdArrowBack } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const CouponExport = () => {
const navigate = useNavigate()
const { batchId } = useParams();

const data = JSON.parse(localStorage.getItem("couponData") || "{}")
console.log(data)


const handleExportCoupons = async() =>{
  try {
    const token = localStorage.getItem("accessToken");
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/coupons/batches/${batchId}/export.pdf`,
      {
        params: {
          batchId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/pdf",
        },
      }
    );
    if (res.status === 200) {
      Swal.fire({
        title: "Success!!",
        text: "Coupon Batch Exported Successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      // Download the file
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `coupon_batch_${batchId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  } catch (error : any) {
    Swal.fire({
      title: "Error!!",
      text: error.response.data.message,
      icon: "error",
      timer: 1500,
      showConfirmButton: false
    });
  }
  
}


    return (
        <div className="flex h-screen bg-[#F8F9FA]">
            <Sidebar />
            <div className="flex-1 overflow-auto flex flex-col">
                <Header title="Preview Coupons" />
                  <div className="min-h-screen bg-[#F5F6F8] p-6">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-500 cursor-pointer mb-6">
            <button
              className="hover:bg-white rounded-full transition-colors text-[#1E2633]"
            >
              <MdArrowBack size={22}  onClick={()=> navigate(-1)} className="cursor-pointer"/>
            </button>
                    <span className="text-[18px] font-semibold text-text-primary">Export Batch</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-[#1E2633] mb-6">
        Export Coupon <br /> Batch
      </h1>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-sm p-8 mb-8 relative">
        
        <div className="space-y-6">
          
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Batch ID</p>
            <p className="text-lg font-semibold text-[#1E2633]">#{data?.batchId}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Creation Date</p>
            <p className="text-sm font-medium text-[#1E2633]">{data?.createdAt?.substring(0, 10)}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Total Coupons</p>
            <p className="text-3xl font-bold text-[#1E2633]">{data?.totalCoupons}</p>
          </div>

          <div>
            <p className="text-xs text-orange-500 uppercase font-semibold">Total Value</p>
            <p className="text-2xl font-bold text-orange-600">{data?.totalPoints} Pts</p>
          </div>

        </div>

        {/* Right Icon */}
        <div className="absolute right-6 top-6 text-gray-200 text-5xl">
          <img src="/wallet.svg" alt="wallet" />
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 uppercase font-semibold mb-4">
          Select Export Format
        </p>

        <div className="flex gap-4">
          
          {/* PDF */}
          {/* <button
            // onClick={() => setFormat("pdf")}
            // className={`flex-1 py-4 rounded-full border text-sm font-semibold transition ${
            //   format === "pdf"
            //     ? "border-orange-500 bg-orange-50 text-orange-600"
            //     : "border-gray-300 text-gray-400"
            }`}
          >
            PDF (Print Ready)
          </button> */}

          {/* CSV */}
          <button
            // onClick={() => setFormat("csv")}
            // className={`flex-1 py-4 rounded-full border text-sm font-semibold transition ${
            //   format === "csv"
            //     ? "border-orange-500 bg-orange-50 text-orange-600"
            //     : "border-gray-300 text-gray-400"
            // }`}
          >
            CSV Transaction History
          </button>

        </div>
      </div>

      {/* Download Button */}
      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg" onClick={handleExportCoupons}>
        <BiDownload size={18} />
        Download
      </button>

      {/* Cancel */}
      <div className="text-center mt-4">
        <button className="text-sm text-orange-500 font-medium hover:underline">
          Cancel / Discard →
        </button>
      </div>
    </div>
            </div>
        </div>
    );
};

export default CouponExport;