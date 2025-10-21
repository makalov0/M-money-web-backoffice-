import React, { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { Upload, Image as ImageIcon, FileCheck, AlertCircle } from "lucide-react";

const UploadImage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [responseImageUrl, setResponseImageUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
        setMessage(null);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage({ type: "error", text: "Please select a file first!" });
            return;
        }
        try {
            setLoading(true);
            setMessage(null);

            // ✅ บีบอัดไฟล์
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
            };
            const compressedBlob = await imageCompression(file, options);
            // ✅ สร้างไฟล์ใหม่ ใช้ชื่อไฟล์จริง
            const compressedFile = new File([compressedBlob], file.name, {
                type: compressedBlob.type,
                lastModified: Date.now(),
            });
            // ✅ ส่งไฟล์ไป backend
            const formData = new FormData();
            formData.append("file", compressedFile);
            formData.append("path", "mounoy");

            const response = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Log the full response
            console.log("Upload response:", response.data);

            // If the server returns image URLs or image data
            if (response.data.imageUrl) {
                console.log("Image URL:", response.data.imageUrl);
                setResponseImageUrl(response.data.imageUrl);
            }
            if (response.data.imageData) {
                console.log("Image data:", response.data.imageData);
                const dataUrl = `data:image/jpeg;base64,${response.data.imageData}`;
                console.log("Data URL:", dataUrl);
                setResponseImageUrl(dataUrl);
            }
            if (response.data.url) {
                console.log("Response URL:", response.data.url);
                setResponseImageUrl(response.data.url);
            }

            setMessage({ type: "success", text: "Upload success!" });
            console.log("File uploaded successfully", compressedFile);

            // ✅ เคลียร์ไฟล์เดิม   
            setFile(null);
            setPreview(null);
            console.log("Original file size:", (file.size / 1024 / 1024).toFixed(2), "MB");
            console.log("Compressed file size:", (compressedFile.size / 1024 / 1024).toFixed(2), "MB");
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Upload failed! Please try again." });
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch and log images from API
    const fetchAndLogImages = async () => {
        try {
            console.log("Fetching images from API...");

            // Example: Fetch images from your API
            const response = await axios.get("/api/images");
            console.log("Images response:", response.data);

            // If response contains image URLs
            if (response.data.images && Array.isArray(response.data.images)) {
                response.data.images.forEach((imageUrl: string, index: number) => {
                    console.log(`Image ${index + 1}:`, imageUrl);
                });
                setResponseImageUrl(response.data.images[0]); // Set first image for display
            }

            // If response contains base64 image data
            if (response.data.imageData) {
                console.log("Base64 image data:", response.data.imageData);
                const dataUrl = `data:image/jpeg;base64,${response.data.imageData}`;
                console.log("Data URL:", dataUrl);
                setResponseImageUrl(dataUrl);
                console.log("Data URL length:", dataUrl.length);
            }

        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    // Function to log image properties
    const logImageProperties = (imageUrl: string) => {
        const img = new Image();
        img.onload = () => {
            console.log("Image properties:", {
                url: imageUrl,
                width: img.width,
                height: img.height,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            });
        };
        img.src = imageUrl;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                        <Upload className="text-red-600" size={32} />
                        Upload & Compress Image
                    </h1>
                    <p className="text-gray-600">Upload and compress your images efficiently</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upload Section */}
                    <div className="bg-white shadow-lg rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <ImageIcon className="text-red-600" size={24} />
                            Select Image
                        </h2>

                        {/* File Input */}
                        <label className="block mb-4">
                            <span className="sr-only">Choose image</span>
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
                                    cursor-pointer"
                            />
                        </label>

                        {/* Preview */}
                        {preview && (
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Original Preview:</h3>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-lg shadow-md"
                                />
                                {file && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={loading || !file}
                            className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Upload Image
                                </>
                            )}
                        </button>

                        {/* Message */}
                        {message && (
                            <div
                                className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${message.type === "success"
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
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileCheck className="text-red-600" size={24} />
                            Uploaded Image
                        </h2>

                        {responseImageUrl ? (
                            <div className="mb-4">
                                <img
                                    src={responseImageUrl}
                                    alt="Response"
                                    className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
                                />
                                <button
                                    onClick={() => logImageProperties(responseImageUrl)}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                                >
                                    Log Image Properties
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={48} />
                                    <p className="text-gray-500">No image uploaded yet</p>
                                </div>
                            </div>
                        )}

                        {/* Test Button */}
                        <button
                            onClick={fetchAndLogImages}
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 mt-4"
                        >
                            Fetch & Log Images from API
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadImage;