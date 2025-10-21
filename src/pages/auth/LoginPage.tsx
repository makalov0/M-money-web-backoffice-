import { useState } from "react";
import { loginApi } from "../../service/authservice";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { mySecretKey } from "../../service/myConst";
import CryptoJS from "crypto-js";

export default function Login() {
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

    // Admin bypass
    if (username === "admin" && password === "admin") {
      toast.success("ເຂົ້າສູ່ລະບົບສຳເລັດ! (Admin Mode)", {
        position: "top-right",
        autoClose: 2000,
      });

      const encryptedRole = CryptoJS.AES.encrypt(
        "admin",
        mySecretKey
      ).toString();
      localStorage.setItem("username", "admin");
      localStorage.setItem("profile", "admin@moneyx.com");
      localStorage.setItem("Role", encryptedRole);
      
      setTimeout(() => navigate("/mainscreen"), 1500);
      setLoading(false);
      return;
    }

    try {
      const response = await loginApi({
        username,
        password,
      }) as { profile?: { role?: string; email?: string } };

      // inform user of success
      toast.success("ເຂົ້າສູ່ລະບົບສຳເລັດ!", {
        position: "top-right",
        autoClose: 2000,
      });

      const role = response.profile?.role ?? "";
      const email = response.profile?.email ?? "";

      if (!role || !email) {
        toast.error("ຂໍ້ຜິດພາດ: ບໍ່ສາມາດດັດແປງຂໍ້ມູນຜູ້ໃຊ້", {
          position: "top-right",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      const encryptedRole = CryptoJS.AES.encrypt(
        role,
        mySecretKey
      ).toString();
      localStorage.setItem("username", username);
      localStorage.setItem("profile", email);
      localStorage.setItem("Role", encryptedRole);
      
      setTimeout(() => navigate("/mainscreen"), 1500);
    } catch (err: unknown) {
      const defaultMsg = "ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ";
      let msg = defaultMsg;

      if (err instanceof Error) {
        // Standard Error object (has message)
        msg = err.message || defaultMsg;
      } else if (typeof err === "object" && err !== null) {
        // Try to handle axios-like error shape safely
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
        
        .lao-font {
            font-family: 'Noto Sans Lao', sans-serif;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-4">
        <ToastContainer />
        
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                M
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white lao-font mb-2">
              M-MoneyX
            </h1>
            <p className="text-red-100 lao-font">ລະບົບຄຸ້ມຄອງການເງິນ</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center lao-font">
              ເຂົ້າສູ່ລະບົບ
            </h2>

            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Username */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ຊື່ຜູ້ໃຊ້"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 transition-colors bg-gray-50 hover:bg-white disabled:opacity-50 lao-font"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ລະຫັດຜ່ານ"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 transition-colors bg-gray-50 hover:bg-white disabled:opacity-50 lao-font"
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 lao-font mt-6"
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

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 lao-font">
                © 2025 M-MoneyX - ລະບົບຄຸ້ມຄອງສິນເຊື່ອ
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}