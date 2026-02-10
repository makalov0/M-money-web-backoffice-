import React, { useState } from "react";
import { Lock, User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginApi } from "../../service/authservice";

type LoginResponse = {
  success?: boolean;
  token?: string;
  profile?: {
    emp_id?: string;
    role?: "ADMIN" | "EMPLOYEE";
    email?: string;
  };
  message?: string;
};

export default function Login(): React.ReactElement {
  const [empId, setEmpId] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!empId || !phone) {
      toast.error("ກະລຸນາປ້ອນ ລະຫັດພະນັກງານ ແລະ ເບີໂທ", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const response = (await loginApi({
        emp_id: empId,
        phone: phone,
      })) as LoginResponse;

      if (!response?.token || !response?.profile?.role) {
        toast.error(response?.message || "ບໍ່ສາມາດເຂົ້າລະບົບໄດ້", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // ✅ store auth info
      localStorage.setItem("token", response.token);
      localStorage.setItem("empId", response.profile.emp_id || empId);
      localStorage.setItem("role", response.profile.role);
      if (response.profile.email) {
        localStorage.setItem("email", response.profile.email);
      }

      toast.success("ເຂົ້າສູ່ລະບົບສຳເລັດ!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => navigate("/mainscreen"), 800);
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດ";

      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === "object" && err !== null) {
        const apiErr = err as { message?: string; data?: { message?: string } };
        msg = apiErr.data?.message || apiErr.message || msg;
      }

      toast.error(`ຂໍ້ຜິດພາດ: ${msg}`, {
        position: "top-right",
        autoClose: 3000,
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        .lao-font { font-family: 'Noto Sans Lao', sans-serif; }
      `}</style>

      <ToastContainer />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#140F36] via-[#1a1447] to-[#0a0820] p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#EF3328] to-[#d62a20] rounded-2xl shadow-lg mb-4">
              <span className="text-3xl font-bold text-white">M</span>
            </div>
            <h1 className="text-3xl font-bold text-white lao-font mb-1">
              M-Money Web Management
            </h1>
            <p className="text-gray-400 lao-font">
              ລະບົບຈັດການສຳລ
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6 text-center lao-font">
              ເຂົ້າສູ່ລະບົບ
            </h2>

            <form className="space-y-5" onSubmit={handleLogin}>
              {/* emp_id */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="ລະຫັດພະນັກງານ"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#EF3328] lao-font"
                />
              </div>

              {/* phone */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ເບີໂທ"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#EF3328] lao-font"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white py-3 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 lao-font"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    ກຳລັງເຂົ້າສູ່ລະບົບ...
                  </>
                ) : (
                  "ເຂົ້າສູ່ລະບົບ"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400 lao-font">
              © 2025 M-Money Web Management
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
