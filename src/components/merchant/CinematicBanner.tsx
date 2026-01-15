import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2 } from "lucide-react";
import { api, toAbsoluteUrl } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

interface CinematicBannerProps {
  businessName: string;
  coverUrl?: string;
  profilePic?: string;
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80";

export function CinematicBanner({ businessName, coverUrl, profilePic }: CinematicBannerProps) {
  const { user, updateUserProfile } = useAppStore();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  
  const backgroundImage = coverUrl || DEFAULT_COVER;
  const userId = (user as any)?.id;

  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
    if (!userId) {
      toast.error("Please log in to update your profile");
      return;
    }

    const setUploading = type === 'cover' ? setUploadingCover : setUploadingProfile;
    setUploading(true);

    try {
      // Step 1: Upload the file
      const uploadResponse = await api.uploadMedia(file);
      
      if (!uploadResponse.success || !uploadResponse.data?.url) {
        toast.error(uploadResponse.error || "Failed to upload image");
        return;
      }

      const imageUrl = toAbsoluteUrl(uploadResponse.data.url);

      // Step 2: Save to user profile with context "partner" for merchant
      const updatePayload = type === 'cover' 
        ? { cover_url: imageUrl, context: 'partner' as const } 
        : { profile_pic: imageUrl, context: 'partner' as const };

      const updateResponse = await api.updateUser(userId, updatePayload);

      if (updateResponse.success) {
        // Step 3: Update local state with partner-specific fields
        updateUserProfile(
          type === 'cover' 
            ? { partner_cover_url: imageUrl } 
            : { partner_profile_pic: imageUrl }
        );
        toast.success(`${type === 'cover' ? 'Cover' : 'Profile'} image updated!`);
      } else {
        toast.error(updateResponse.error || "Failed to save image");
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, 'cover');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, 'profile');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative h-32 sm:h-40 w-full rounded-2xl sm:rounded-3xl overflow-hidden mb-4 sm:mb-6"
    >
      {/* Hidden file inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />
      <input
        ref={profileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfileChange}
      />

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          filter: coverUrl ? "none" : "blur(2px)",
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/50 to-transparent" />

      {/* Edit Cover Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => coverInputRef.current?.click()}
        disabled={uploadingCover}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1.5 text-xs text-white/80 hover:text-white transition-colors disabled:opacity-50"
      >
        {uploadingCover ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Camera className="h-3.5 w-3.5" />
        )}
        {uploadingCover ? "Uploading..." : "Edit Cover"}
      </motion.button>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center px-4 sm:px-8">
        {/* Profile Picture with Edit Overlay */}
        {profilePic && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mr-3 sm:mr-6 flex-shrink-0 relative group"
          >
            <img
              src={profilePic}
              alt="Profile"
              className="h-14 w-14 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl object-cover border-2 border-white/20 shadow-xl"
            />
            {/* Edit Profile Pic Overlay */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => profileInputRef.current?.click()}
              disabled={uploadingProfile}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl disabled:opacity-50"
            >
              {uploadingProfile ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </motion.button>
          </motion.div>
        )}
        <div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 text-sm font-medium mb-1"
          >
            Welcome back,
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg line-clamp-1"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {businessName}
          </motion.h1>
        </div>
      </div>
    </motion.div>
  );
}
