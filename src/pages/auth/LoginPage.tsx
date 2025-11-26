import React, { useState } from "react";
import { Lock, Mail, Loader2 } from "lucide-react";
import * as CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginApi } from "../../service/authservice";
import { mySecretKey } from "../../service/myConst";

export default function Login(): React.ReactElement {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);

    // Admin bypass (kept for convenience)
    if (username === "admin" && password === "admin") {
      toast.success("ເຂົ້າສູ່ລະບົບສຳເລັດ! (Admin Mode)", {
        position: "top-right",
        autoClose: 2000,
      });

      const encryptedRole = CryptoJS.AES.encrypt("admin", mySecretKey).toString();
      localStorage.setItem("username", "admin");
      localStorage.setItem("profile", "admin@moneyx.com");
      localStorage.setItem("Role", encryptedRole);

      setTimeout(() => navigate("/mainscreen"), 1500);
      setLoading(false);
      return;
    }

    try {
      const response = (await loginApi({
        username,
        password,
      })) as { profile?: { role?: string; email?: string } };

      toast.success("ເຂົ້າສູ່ລະບົບສຳເລັດ!", {
        position: "top-right",
        autoClose: 2000,
      });

      const role = response?.profile?.role ?? "";
      const email = response?.profile?.email ?? "";

      if (!role || !email) {
        toast.error("ຂໍ້ຜິດພາດ: ບໍ່ສາມາດດັດແປງຂໍ້ມູນຜູໃຊ້", {
          position: "top-right",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      const encryptedRole = CryptoJS.AES.encrypt(role, mySecretKey).toString();
      localStorage.setItem("username", username);
      localStorage.setItem("profile", email);
      localStorage.setItem("Role", encryptedRole);

      setTimeout(() => navigate("/mainscreen"), 1500);
    } catch (err: unknown) {
      const defaultMsg = "ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ";
      let msg = defaultMsg;

      if (err instanceof Error) {
        msg = err.message || defaultMsg;
      } else if (typeof err === "object" && err !== null) {
        const axiosLike = err as { response?: { data?: { message?: string } } };
        msg = axiosLike.response?.data?.message ?? defaultMsg;
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#140F36] via-[#1a1447] to-[#0a0820] p-4 relative overflow-hidden">
        {/* Background logo watermark */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat opacity-5"
          style={{
            backgroundImage: 'url(/logo.jpg)',
            backgroundSize: '50%',
          }}
        ></div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#EF3328]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#EF3328]/10 rounded-full blur-3xl"></div>
        
        {/* White decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#EF3328] to-[#d62a20] rounded-2xl shadow-lg mb-4">
              <span className="text-3xl font-bold text-white">M</span>
            </div>
            <h1 className="text-4xl font-bold text-white lao-font mb-2">M-Money Web Management</h1>
            <p className="text-[#454350] lao-font">ລະບົບຈັດການເວັບ M-Money</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center lao-font">ເຂົ້າສູ່ລະບົບ</h2>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#EF3328] transition-colors" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ຊື່ຜູ້ໃຊ້"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 border-2 border-white/20 rounded-xl focus:outline-none focus:border-[#EF3328] transition-colors bg-white/5 hover:bg-white/10 disabled:opacity-50 lao-font text-white placeholder:text-gray-400"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#EF3328] transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ລະຫັດຜ່ານ"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 border-2 border-white/20 rounded-xl focus:outline-none focus:border-[#EF3328] transition-colors bg-white/5 hover:bg-white/10 disabled:opacity-50 lao-font text-white placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 lao-font mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    ກຳລັງເຂົ້າສູ່ລະບົບ...
                  </>
                ) : (
                  "ເຂົ້າສູ່ລະບົບ"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400 lao-font">© 2025 M-Money Web Management</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}