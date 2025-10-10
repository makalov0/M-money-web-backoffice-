import React, { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";

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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Upload & Compress Image</h1>

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
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
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
                            className="w-64 h-40 object-cover rounded-lg shadow-md mx-auto"
                        />
                    </div>
                )}

                {/* Response Image */}
                {responseImageUrl && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Response Image:</h3>
                        <img
                            src={responseImageUrl}
                            alt="Response"
                            className="w-64 h-40 object-cover rounded-lg shadow-md mx-auto"
                        />
                    </div>
                )}

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>

                {/* Test Buttons */}
                <div className="mt-4 space-y-2">
                    <button
                        onClick={fetchAndLogImages}
                        className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                    >
                        Fetch & Log Images from API
                    </button>

                    {responseImageUrl && (
                        <button
                            onClick={() => logImageProperties(responseImageUrl)}
                            className="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
                        >
                            Log Image Properties
                        </button>
                    )}
                </div>

                {/* Message */}
                {message && (
                    <p
                        className={`mt-4 text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default UploadImage;
