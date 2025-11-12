import { useState } from "react";
import axios from "axios";
import { Upload, FileCheck, AlertCircle, Info, Maximize2, ImageIcon } from "lucide-react";

const UploadImage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [responseImageUrl, setResponseImageUrl] = useState<string | null>(null);
    const [compressionInfo, setCompressionInfo] = useState<{
        originalSize: string;
        compressedSize: string;
        reduction: string;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
        setMessage(null);
        setCompressionInfo(null);
        setCompressedPreview(null);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage({ type: "error", text: "ກະລຸນາເລືອກໄຟລ່ກ່ອນ!" });
            return;
        }
        try {
            setLoading(true);
            setMessage(null);

            const originalSize = file.size;

            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("🔄 ກຳລັງບີບອັດຮູບດ້ວຍ Canvas...");
            console.log("📁 ຊື່ໄຟລ໌:", file.name);
            console.log("📊 ຂະໜາດເດີມ:", (originalSize / 1024).toFixed(2), "KB (", (originalSize / 1024 / 1024).toFixed(2), "MB)");
            
            // ✅ ໃຊ້ Canvas ເພື່ອບີບອັດຮູບແທນ browser-image-compression
            const compressedBlob = await new Promise<Blob>((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    
                    if (!ctx) {
                        reject(new Error("ບໍ່ສາມາດສ້າງ Canvas Context ໄດ້"));
                        return;
                    }
                    
                    // ກຳນົດຂະໜາດໃໝ່ (ຮັກສາອັດຕາສ່ວນ)
                    const maxSize = 1024;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // ຕັ້ງຄ່າຄຸນນະພາບສູງ
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // ແປງເປັນ Blob (JPEG, ຄຸນນະພາບ 0.7)
                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error("ບໍ່ສາມາດສ້າງ Blob ໄດ້"));
                        },
                        "image/jpeg",
                        0.7
                    );
                };
                img.onerror = () => reject(new Error("ບໍ່ສາມາດໂຫຼດຮູບໄດ້"));
                img.src = URL.createObjectURL(file);
            });
            
            console.log("✅ ບີບອັດສຳເລັດ!");
            console.log("📊 ຂະໜາດຫຼັງບີບອັດ:", (compressedBlob.size / 1024).toFixed(2), "KB (", (compressedBlob.size / 1024 / 1024).toFixed(2), "MB)");
            
            // ✅ ສ້າງໄຟລ໌ໃໝ່ດ້ວຍຊື່ເດີມ
            const compressedFile = new File([compressedBlob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });

            // ✅ ສ້າງ Preview ຂອງຮູບທີ່ບີບອັດແລ້ວ
            const compressedPreviewUrl = URL.createObjectURL(compressedFile);
            setCompressedPreview(compressedPreviewUrl);

            const compressedSize = compressedFile.size;
            const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
            const savedSize = originalSize - compressedSize;

            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("📊 ສະຫຼຸບຜົນການບີບອັດ:");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("📤 ກ່ອນບີບອັດ:", (originalSize / 1024).toFixed(2), "KB");
            console.log("📥 ຫຼັງບີບອັດ:", (compressedSize / 1024).toFixed(2), "KB");
            console.log("💾 ປະຫຍັດໄດ້:", (savedSize / 1024).toFixed(2), "KB");
            console.log("📉 ຫຼຸດລົງ:", reduction + "%");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            // ✅ ບັນທຶກຂໍ້ມູນການບີບອັດ
            setCompressionInfo({
                originalSize: (originalSize / 1024 / 1024).toFixed(2),
                compressedSize: (compressedSize / 1024 / 1024).toFixed(2),
                reduction: reduction,
            });

            console.log("📊 ຂະໜາດເດີມ:", (originalSize / 1024 / 1024).toFixed(2), "MB");
            console.log("📊 ຂະໜາດໃໝ່:", (compressedSize / 1024 / 1024).toFixed(2), "MB");
            console.log("📊 ຫຼຸດລົງ:", reduction + "%");

            // ✅ ສ່ງໄຟລ໌ໄປ backend
            const formData = new FormData();
            formData.append("file", compressedFile);
            formData.append("path", "mounoy");

            const response = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ ອັບໂຫຼດສຳເລັດ:", response.data);

            // ✅ ຈັດການ URL ຮູບທີ່ສົ່ງກັບມາ
            if (response.data.imageUrl) {
                setResponseImageUrl(response.data.imageUrl);
            } else if (response.data.imageData) {
                const dataUrl = `data:image/jpeg;base64,${response.data.imageData}`;
                setResponseImageUrl(dataUrl);
            } else if (response.data.url) {
                setResponseImageUrl(response.data.url);
            }

            setMessage({ 
                type: "success", 
                text: `ອັບໂຫຼດສຳເລັດ! ຫຼຸດຂະໜາດລົງ ${reduction}%` 
            });

            // ✅ ເຄລຍຮູບເກົ່າອອກ
            setFile(null);
            setPreview(null);
            setCompressedPreview(null);

        } catch (err) {
            console.error("❌ ເກີດຂໍ້ຜິດພາດ:", err);
            setMessage({ type: "error", text: "ອັບໂຫຼດລົ້ມເຫລວ! ກະລຸນາລອງໃໝ່ອີກຄັ້ງ." });
        } finally {
            setLoading(false);
        }
    };

    // ✅ ດຶງຮູບຈາກ API ແລະ ສະແດງໃນ Console
    const fetchAndLogImages = async () => {
        try {
            console.log("🔍 ກຳລັງດຶງຮູບຈາກ API...");
            const response = await axios.get("/https://mmoney.la/ImageServer/mounoy");
            console.log("📷 ຮູບພາບທີ່ໄດ້ຮັບ:", response.data);

            if (response.data.images && Array.isArray(response.data.images)) {
                response.data.images.forEach((imageUrl: string, index: number) => {
                    console.log(`🖼️ ຮູບທີ່ ${index + 1}:`, imageUrl);
                });
                if (response.data.images.length > 0) {
                    setResponseImageUrl(response.data.images[0]);
                }
            }

            if (response.data.imageData) {
                const dataUrl = `data:image/jpeg;base64,${response.data.imageData}`;
                setResponseImageUrl(dataUrl);
                console.log("📏 ຂະໜາດ Data URL:", dataUrl.length, "characters");
            }

        } catch (error) {
            console.error("❌ ເກີດຂໍ້ຜິດພາດໃນການດຶງຮູບ:", error);
        }
    };

    // ✅ ສະແດງຂໍ້ມູນຮູບໃນ Console
    const logImageProperties = (imageUrl: string) => {
        const img = new window.Image();
        img.onload = () => {
            console.log("🖼️ ຂໍ້ມູນຮູບພາບ:", {
                url: imageUrl,
                ຄວາມກວ້າງ: img.width + "px",
                ຄວາມສູງ: img.height + "px",
                ຄວາມກວ້າງຕົວຈິງ: img.naturalWidth + "px",
                ຄວາມສູງຕົວຈິງ: img.naturalHeight + "px",
                ອັດຕາສ່ວນ: (img.naturalWidth / img.naturalHeight).toFixed(2),
            });
        };
        img.onerror = () => {
            console.error("❌ ບໍ່ສາມາດໂຫຼດຮູບໄດ້");
        };
        img.src = imageUrl;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
                .lao-font { font-family: 'Noto Sans Lao', sans-serif; }
            `}</style>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3 lao-font">
                        <Upload className="text-red-600" size={32} />
                        ອັບໂຫຼດ & ບີບອັດຮູບພາບ
                    </h1>
                    <p className="text-gray-600 lao-font">ບີບອັດຮູບພາບດ້ວຍ Canvas API (ຄຸນນະພາບສູງ)</p>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Info className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1 lao-font">ການຕັ້ງຄ່າການບີບອັດດ້ວຍ Canvas:</h3>
                            <ul className="text-sm text-blue-800 space-y-1 lao-font">
                                <li>• ຄວາມລະອຽດສູງສຸດ: 1024x1024px (ຮັກສາອັດຕາສ່ວນ)</li>
                                <li>• ຄຸນນະພາບ JPEG: 70% (ຄວາມສົມດູນທີ່ດີ)</li>
                                <li>• Image Smoothing: High Quality</li>
                                <li>• ປະເພດໄຟລ໌: JPEG (ຂະໜາດນ້ອຍ)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upload Section */}
                    <div className="bg-white shadow-lg rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 lao-font">
                            <ImageIcon className="text-red-600" size={24} />
                            ເລືອກຮູບພາບ
                        </h2>

                        {/* File Input */}
                        <label className="block mb-4">
                            <span className="sr-only">ເລືອກຮູບ</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-600 
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-red-50 file:text-red-700
                                    hover:file:bg-red-100
                                    cursor-pointer lao-font"
                            />
                        </label>

                        {/* Original & Compressed Preview Side by Side */}
                        {preview && (
                            <div className="mb-4 space-y-4">
                                {/* Original Preview */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-2 lao-font flex items-center justify-between">
                                        <span>ຮູບຕົ້ນສະບັບ:</span>
                                        {file && (
                                            <span className="text-xs text-red-600 font-bold">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        )}
                                    </h3>
                                    <img
                                        src={preview}
                                        alt="Original"
                                        className="w-full h-48 object-cover rounded-lg shadow-md border-2 border-red-200"
                                    />
                                </div>

                                {/* Compressed Preview */}
                                {compressedPreview && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-600 mb-2 lao-font flex items-center justify-between">
                                            <span>ຮູບຫຼັງບີບອັດ:</span>
                                            {compressionInfo && (
                                                <span className="text-xs text-green-600 font-bold">
                                                    {compressionInfo.compressedSize} MB
                                                </span>
                                            )}
                                        </h3>
                                        <img
                                            src={compressedPreview}
                                            alt="Compressed"
                                            className="w-full h-48 object-cover rounded-lg shadow-md border-2 border-green-200"
                                        />
                                    </div>
                                )}

                                {/* File Size Info */}
                                {file && !compressedPreview && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700 lao-font">
                                            <span className="font-semibold">ຂະໜາດເດີມ:</span>{" "}
                                            <span className="text-red-600 font-bold">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 lao-font">
                                            ກົດປຸ່ມອັບໂຫຼດເພື່ອເຫັນຮູບຫຼັງບີບອັດ
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Compression Info */}
                        {compressionInfo && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Maximize2 className="text-green-600" size={20} />
                                    <h4 className="font-semibold text-green-900 lao-font">ຜົນການບີບອັດ (Canvas)</h4>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-700 lao-font">
                                        <span className="font-medium">ເດີມ:</span>{" "}
                                        <span className="text-red-600 font-bold">{compressionInfo.originalSize} MB</span>
                                        <span className="text-gray-500 text-xs ml-2">
                                            ({(parseFloat(compressionInfo.originalSize) * 1024).toFixed(0)} KB)
                                        </span>
                                    </p>
                                    <p className="text-gray-700 lao-font">
                                        <span className="font-medium">ໃໝ່:</span>{" "}
                                        <span className="text-green-600 font-bold">{compressionInfo.compressedSize} MB</span>
                                        <span className="text-gray-500 text-xs ml-2">
                                            ({(parseFloat(compressionInfo.compressedSize) * 1024).toFixed(0)} KB)
                                        </span>
                                    </p>
                                    <p className="text-gray-700 lao-font">
                                        <span className="font-medium">ປະຫຍັດ:</span>{" "}
                                        <span className="text-orange-600 font-bold">
                                            {((parseFloat(compressionInfo.originalSize) - parseFloat(compressionInfo.compressedSize)) * 1024).toFixed(0)} KB
                                        </span>
                                    </p>
                                    <div className="pt-2 mt-2 border-t border-green-200">
                                        <p className="text-gray-700 font-semibold lao-font">
                                            <span className="font-medium">ຫຼຸດລົງ:</span>{" "}
                                            <span className="text-green-600 text-xl">{compressionInfo.reduction}%</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={loading || !file}
                            className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2 lao-font"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ກຳລັງອັບໂຫຼດ...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    ອັບໂຫຼດຮູບພາບ
                                </>
                            )}
                        </button>

                        {/* Message */}
                        {message && (
                            <div
                                className={`mt-4 p-3 rounded-lg flex items-center gap-2 lao-font ${
                                    message.type === "success"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                            >
                                {message.type === "success" ? (
                                    <FileCheck size={20} />
                                ) : (
                                    <AlertCircle size={20} />
                                )}
                                <span className="text-sm font-medium">{message.text}</span>
                            </div>
                        )}
                    </div>

                    {/* Response Section */}
                    <div className="bg-white shadow-lg rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 lao-font">
                            <FileCheck className="text-red-600" size={24} />
                            ຮູບທີ່ອັບໂຫຼດແລ້ວ
                        </h2>

                        {responseImageUrl ? (
                            <div className="mb-4">
                                <img
                                    src={responseImageUrl}
                                    alt="Uploaded"
                                    className="w-full h-64 object-cover rounded-lg shadow-md border-2 border-green-200 mb-4"
                                />
                                <button
                                    onClick={() => logImageProperties(responseImageUrl)}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 lao-font"
                                >
                                    ເບິ່ງຂໍ້ມູນຮູບໃນ Console
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={48} />
                                    <p className="text-gray-500 lao-font">ຍັງບໍ່ທັນມີຮູບ</p>
                                    <p className="text-sm text-gray-400 mt-1 lao-font">ອັບໂຫຼດຮູບເພື່ອເບິ່ງຜົນລັບ</p>
                                </div>
                            </div>
                        )}

                        {/* Test Button */}
                        <button
                            onClick={fetchAndLogImages}
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 mt-4 lao-font"
                        >
                            ດຶງຮູບຈາກ API
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadImage;