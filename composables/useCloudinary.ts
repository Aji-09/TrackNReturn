export const useCloudinary = () => {
    const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dqwbka5al/image/upload";
    const CLOUDINARY_UPLOAD_PRESET = "claim-items";
  
    const uploadImage = async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
      try {
        const response = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
        const data = await response.json();
  
        if (data.secure_url) {
          return data.secure_url;  // Returning the Cloudinary URL
        } else {
          throw new Error("Failed to get the image URL.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        return null;
      }
    };
  
    return {
      uploadImage,
    };
  };
  