import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, Upload, Send, Image as ImageIcon, X, Wand2,
  Gift, Calendar, MapPin, LocateFixed, Eye, DollarSign, Rocket,
  Trash2, Pencil
} from "lucide-react";
import { api, toAbsoluteUrl } from "@/services/api";


interface ActiveCampaign {
  id: string;
  title: string;
  type: 'drop' | 'mission';
  thumbnail: string | null;
  revenue: number;
  scans: number;
  status: 'live';
  createdAt: Date;
  // Drop-specific
  reward_text?: string;
  condition_text?: string;
  // Mission-specific
  commission_details?: string;
}
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L, { LeafletEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

const PARTNER_COLOR = "#1DB09B";

// Fix default marker icon issue with Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Custom teal marker icon
const tealIcon = new L.DivIcon({
  className: 'custom-marker-draggable',
  html: `
    <div class="marker-pin">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
    <style>
      .custom-marker-draggable {
        cursor: grab !important;
      }
      .custom-marker-draggable * {
        cursor: inherit !important;
      }
      .custom-marker-draggable .marker-pin {
        width: 32px;
        height: 32px;
        background: #1DB09B;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s ease, background 0.15s ease;
      }
      .custom-marker-draggable:hover .marker-pin {
        transform: scale(1.15);
        background: #22c9ad;
      }
      .leaflet-dragging .custom-marker-draggable,
      .leaflet-dragging .custom-marker-draggable * {
        cursor: grabbing !important;
      }
      .leaflet-dragging .custom-marker-draggable .marker-pin {
        transform: scale(1.2);
        background: #19a088;
      }
    </style>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to recenter map when coordinates change or recenter is triggered
function MapRecenter({ coords, trigger }: { coords: [number, number]; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map, trigger]);
  return null;
}

export function CreateDropStudio() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasMedia, setHasMedia] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isMission, setIsMission] = useState(false);
  const [missionReward, setMissionReward] = useState("500");
  const [missionAction, setMissionAction] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Drop-specific fields
  const [rewardText, setRewardText] = useState("");
  const [conditionText, setConditionText] = useState("");
  // Mission-specific fields
  const [commissionDetails, setCommissionDetails] = useState("");
  
  // Active campaigns state
  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);
  
  // Map state
  const [coords, setCoords] = useState<[number, number]>([51.5074, -0.1278]); // Default: London
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null); // Store user's actual location
  const [mapLoading, setMapLoading] = useState(true);
  const [locationName, setLocationName] = useState("London, UK");
  const [recenterTrigger, setRecenterTrigger] = useState(0); // Force recenter

  // Fetch campaigns from backend on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.getCampaigns(1); // Hardcoded partner_id for now
        if (response.success && response.data) {
          const campaigns: ActiveCampaign[] = response.data.map((c: any) => {
            const rawMediaUrl = c.media_url ?? c.image_url ?? c.thumbnail ?? null;
            const resolvedThumb = rawMediaUrl ? toAbsoluteUrl(rawMediaUrl) : null;

            return {
              id: c.id?.toString() || c.campaign_id?.toString(),
              title: c.title,
              type: c.type === 'mission' ? 'mission' : 'drop',
              thumbnail: resolvedThumb,
              revenue: parseFloat(c.revenue) || 0,
              scans: parseInt(c.scans) || 0,
              status: 'live' as const,
              createdAt: new Date(c.created_at || Date.now()),
              reward_text: c.reward_text || undefined,
              condition_text: c.condition_text || undefined,
              commission_details: c.commission_details || undefined,
            };
          });
          setActiveCampaigns(campaigns);
        }
      } catch (error) {
        console.log("Failed to fetch campaigns:", error);
      }
    };
    fetchCampaigns();
  }, []);

  // Geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          setUserCoords([latitude, longitude]);
          setLocationName("Your Location");
          setMapLoading(false);
        },
        (error) => {
          console.log("Geolocation permission denied, using default:", error.message);
          setMapLoading(false);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setMapLoading(false);
    }
  }, []);

  const handleRecenter = () => {
    if (userCoords) {
      setCoords([...userCoords]); // Create new array reference
      setLocationName("Your Location");
      setRecenterTrigger(prev => prev + 1); // Force map recenter
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCoords: [number, number] = [latitude, longitude];
          setCoords(newCoords);
          setUserCoords(newCoords);
          setLocationName("Your Location");
          setRecenterTrigger(prev => prev + 1);
        },
        (error) => {
          console.log("Geolocation error:", error.message);
        }
      );
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedTitle = aiPrompt.includes("happy hour") 
      ? "Happy Hour Special 🍹" 
      : aiPrompt.includes("lunch")
      ? "Power Lunch Deal 🥗"
      : aiPrompt.includes("student")
      ? "Student Night Special 🎓"
      : `${aiPrompt.charAt(0).toUpperCase() + aiPrompt.slice(1)} Special ✨`;
    
    const generatedDescription = `Don't miss our exclusive ${aiPrompt}! Limited time offer for VibeCheck members. Experience the best of what we have to offer at an unbeatable price. Tag us and share your experience!`;
    
    setTitle(generatedTitle);
    setDescription(generatedDescription);
    // Don't set auto-generated images - only user uploads
    setIsGenerating(false);
    setAiPrompt("");
    toast.success("Campaign generated with AI!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setMediaFile(file);
      setHasMedia(true);
    }
  };

  const hasContent = title || description || hasMedia;
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!hasContent || isPublishing) return;
    
    setIsPublishing(true);
    
    try {
      // Step 1: Upload media file if present
      let uploadedMediaUrl: string | undefined;

      if (mediaFile) {
        toast.info("Uploading media...");
        const uploadResponse = await api.uploadMedia(mediaFile);

        if (uploadResponse.success && uploadResponse.data?.url) {
          uploadedMediaUrl = toAbsoluteUrl(uploadResponse.data.url);
          toast.success("Media uploaded!");
        } else {
          toast.error(uploadResponse.error || "Failed to upload media");
          setIsPublishing(false);
          return;
        }
      }

      // Step 2: Prepare campaign data with uploaded media URL
      const campaignPayload = {
        partner_id: 1, // Hardcoded for now until auth is ready
        title: title || "Untitled Campaign",
        description: description || "",
        type: isMission ? ('mission' as const) : ('drop' as const),
        latitude: coords[0],
        longitude: coords[1],
        start_date: startDate || new Date().toISOString().split('T')[0],
        end_date: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reward_points: isMission ? parseInt(missionReward) || 500 : undefined,
        mission_action: isMission ? missionAction : undefined,
        media_url: uploadedMediaUrl, // Use the uploaded URL
        // Drop-specific
        reward_text: !isMission ? rewardText : undefined,
        condition_text: !isMission ? conditionText : undefined,
        // Mission-specific
        commission_details: isMission ? commissionDetails : undefined,
      };

      // Step 3: Create the campaign
      const response = await api.createCampaign(campaignPayload);
      
      if (response.success && response.data) {
        // Add to local state for immediate UI feedback
        const newCampaign: ActiveCampaign = {
          id: response.data.campaign_id,
          title: title || "Untitled Campaign",
          type: isMission ? 'mission' : 'drop',
          thumbnail: uploadedMediaUrl ? toAbsoluteUrl(uploadedMediaUrl) : null,
          revenue: 0,
          scans: 0,
          status: 'live',
          createdAt: new Date(),
          reward_text: !isMission ? rewardText : undefined,
          condition_text: !isMission ? conditionText : undefined,
          commission_details: isMission ? commissionDetails : undefined,
        };
        
        setActiveCampaigns(prev => [newCampaign, ...prev]);
        
        // Reset form
        setTitle("");
        setDescription("");
        setHasMedia(false);
        setPreviewImage(null);
        setMediaFile(null);
        setStartDate("");
        setEndDate("");
        setIsMission(false);
        setMissionReward("500");
        setMissionAction("");
        setRewardText("");
        setConditionText("");
        setCommissionDetails("");
        
        toast.success(`Campaign Published! ID: ${response.data.campaign_id}`);
      } else {
        toast.error(response.error || "Failed to publish campaign");
      }
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Delete a campaign
  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await api.deleteCampaign(campaignId);
      if (response.success) {
        setActiveCampaigns(prev => prev.filter(c => c.id !== campaignId));
        toast.success("Campaign deleted successfully");
      } else {
        toast.error(response.error || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Edit a campaign (simple prompt for now)
  const handleEditCampaign = async (campaignId: string, currentTitle: string) => {
    const newTitle = window.prompt("Enter new campaign title:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;
    
    try {
      const response = await api.updateCampaign(campaignId, { title: newTitle });
      if (response.success) {
        setActiveCampaigns(prev => prev.map(c => 
          c.id === campaignId ? { ...c, title: newTitle } : c
        ));
        toast.success("Campaign updated successfully");
      } else {
        toast.error(response.error || "Failed to update campaign");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const inputStyles = "w-full rounded-lg bg-black/40 border border-white/10 px-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1DB09B]";

  return (
    <div className="rounded-2xl bg-[#0f1929] border border-[#1e3a5f]/30 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5" style={{ color: PARTNER_COLOR }} />
          <h4 className="font-heading font-semibold text-white">Quest Line / Gig Generator</h4>
        </div>
        <p className="text-xs text-gray-400">Create 'Loot Drops' (Quest Lines) to post to the user app or Gigs for influencers.</p>
      </div>

      {/* Split Studio Layout */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ========== LEFT COLUMN: Creative Zone ========== */}
          <div className="space-y-5">
            {/* AI Campaign Builder */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-5 rounded-xl overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${PARTNER_COLOR}15, ${PARTNER_COLOR}05)`,
              }}
            >
              {/* Premium gradient border effect */}
              <div 
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ 
                  background: `linear-gradient(135deg, ${PARTNER_COLOR}40, ${PARTNER_COLOR}20, transparent)`,
                  padding: '1px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
              
              {/* Subtle glow effect */}
              <div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30"
                style={{ background: PARTNER_COLOR }}
              />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${PARTNER_COLOR}, ${PARTNER_COLOR}cc)` }}
                  >
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      AI Campaign Builder
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-normal">Magic Start</span>
                    </h5>
                    <p className="text-xs text-gray-400">Let AI write your entire campaign</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Describe your goal (e.g., 'Happy hour for students')..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                    className={`${inputStyles} h-[46px] flex-1`}
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleAIGenerate}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="h-[46px] px-4 text-white font-medium"
                      style={{ background: PARTNER_COLOR }}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">or build manually</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Title input */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">Campaign Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Happy Hour Special"
                className={`${inputStyles} h-11`}
              />
            </div>

            {/* Description input */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your campaign description..."
                className={`${inputStyles} h-28 p-3 resize-none`}
              />
              <span className="text-xs text-gray-500">{description.length}/2200</span>
            </div>

            {/* Conditional Fields based on type */}
            <AnimatePresence mode="wait">
              {isMission ? (
                /* Mission-specific fields */
                <motion.div
                  key="mission-fields"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 p-4 rounded-xl border border-[#A759D8]/20 bg-[#A759D8]/5"
                >
                  <p className="text-xs text-[#A759D8] font-medium">Influencer Gig Details</p>
                  
                  {/* Commission / Payment */}
                  <div>
                    <label className="text-xs text-[#A759D8] mb-1.5 block font-medium">Commission / Payment</label>
                    <input
                      type="text"
                      value={commissionDetails}
                      onChange={(e) => setCommissionDetails(e.target.value)}
                      placeholder="e.g., $50 flat fee, 10% of sales"
                      className={`${inputStyles} h-11 focus:ring-[#A759D8]`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block font-medium">Reward (Points)</label>
                      <input
                        type="number"
                        value={missionReward}
                        onChange={(e) => setMissionReward(e.target.value)}
                        placeholder="500"
                        className={`${inputStyles} h-11`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block font-medium">Action Required</label>
                      <Select value={missionAction} onValueChange={setMissionAction}>
                        <SelectTrigger className="w-full h-11 rounded-lg bg-black/40 border-white/10 text-sm text-white focus:ring-2 focus:ring-[#A759D8]">
                          <SelectValue placeholder="Select action..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1929] border-white/10">
                          <SelectItem value="photo">Photo Upload</SelectItem>
                          <SelectItem value="checkin">Check-in</SelectItem>
                          <SelectItem value="share">Social Share</SelectItem>
                          <SelectItem value="review">Write Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Drop-specific fields */
                <motion.div
                  key="drop-fields"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 p-4 rounded-xl border border-[#1DB09B]/20 bg-[#1DB09B]/5"
                >
                  <p className="text-xs font-medium" style={{ color: PARTNER_COLOR }}>Loot Drop Details</p>
                  
                  {/* Reward / Offer */}
                  <div>
                    <label className="text-xs mb-1.5 block font-medium" style={{ color: PARTNER_COLOR }}>Reward / Offer</label>
                    <input
                      type="text"
                      value={rewardText}
                      onChange={(e) => setRewardText(e.target.value)}
                      placeholder="e.g., Free Coffee, 20% Off"
                      className={`${inputStyles} h-11`}
                    />
                  </div>
                  
                  {/* Unlock Condition */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Unlock Condition</label>
                    <input
                      type="text"
                      value={conditionText}
                      onChange={(e) => setConditionText(e.target.value)}
                      placeholder="e.g., With purchase of pastry"
                      className={`${inputStyles} h-11`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ========== RIGHT COLUMN: Settings & Context Zone ========== */}
          <div className="space-y-4">
            {/* Map Section - Fixed Height */}
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/40 h-[400px] flex flex-col">
              {/* Map Header */}
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#1DB09B] flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Target Location</h5>
                    <p className="text-[10px] text-gray-400">{locationName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6] animate-pulse" />
                  <span className="text-[10px] text-gray-400">Live</span>
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 relative">
                {mapLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-8 w-8 text-[#1DB09B] animate-spin" />
                  </div>
                ) : (
                  <>
                    <MapContainer
                      center={coords}
                      zoom={14}
                      style={{ height: "100%", width: "100%" }}
                      zoomControl={false}
                      attributionControl={false}
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      />
                      <MapRecenter coords={coords} trigger={recenterTrigger} />
                      <Marker 
                        position={coords} 
                        icon={tealIcon} 
                        draggable={true}
                        eventHandlers={{
                          dragend: (e: LeafletEvent) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            setCoords([position.lat, position.lng]);
                            setLocationName("Custom Location");
                          },
                        }}
                      />
                    </MapContainer>
                    {/* Helper Text Badge */}
                    <div className="absolute top-2 right-2 z-[1000] px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="text-[10px] text-gray-300">Drag pin to adjust</span>
                    </div>
                    {/* Recenter Button */}
                    <button
                      onClick={handleRecenter}
                      className="absolute bottom-2 right-2 z-[1000] p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 hover:border-[#1DB09B]/50 transition-colors group"
                      title="Recenter to your location"
                    >
                      <LocateFixed className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#1DB09B] transition-colors" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Configuration Section - Below Map */}
            <div className="space-y-4 p-4 rounded-xl bg-black/30 border border-white/5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Configuration</p>
              
              {/* Campaign Type Toggle */}
              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isMission ? (
                      <Gift className="h-4 w-4 text-[#A759D8]" />
                    ) : (
                      <Gift className="h-4 w-4" style={{ color: PARTNER_COLOR }} />
                    )}
                    <span className="text-sm font-medium text-white">
                      {isMission ? 'Mission' : 'Loot Drop'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">Drop</span>
                    <Switch checked={isMission} onCheckedChange={setIsMission} />
                    <span className="text-[10px] text-gray-500">Mission</span>
                  </div>
                </div>
              </div>

              {/* Date Grid - 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`${inputStyles} h-10 pl-10 text-xs [color-scheme:dark]`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`${inputStyles} h-10 pl-10 text-xs [color-scheme:dark]`}
                    />
                  </div>
                </div>
              </div>

              {/* Media dropzone */}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block font-medium">Media</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="media-upload"
                />
                <motion.label
                  htmlFor="media-upload"
                  whileHover={{ scale: 1.01 }}
                  className={`relative rounded-lg border-2 border-dashed ${hasMedia ? 'border-[#1DB09B] bg-[#1DB09B]/5' : 'border-white/10 bg-black/40'} p-3 text-center cursor-pointer transition-colors hover:border-[#1DB09B]/50 flex items-center justify-center h-12`}
                >
                  {hasMedia ? (
                    <div className="flex items-center justify-center gap-2">
                      <ImageIcon className="h-4 w-4" style={{ color: PARTNER_COLOR }} />
                      <span className="text-xs font-medium" style={{ color: PARTNER_COLOR }}>1 image added</span>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHasMedia(false); setPreviewImage(null); setMediaFile(null); }}
                        className="ml-2 p-1 rounded-full hover:bg-white/10"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2 text-gray-500" />
                      <p className="text-xs text-gray-400">Drop media (PNG, JPG, MP4)</p>
                    </>
                  )}
                </motion.label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer - Full-Width Publish Button */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <motion.div whileHover={{ scale: isPublishing ? 1 : 1.02 }} whileTap={{ scale: isPublishing ? 1 : 0.98 }}>
            <Button 
              className="w-full h-12 text-white font-semibold text-base" 
              style={{ background: PARTNER_COLOR }}
              disabled={!hasContent || isPublishing}
              onClick={handlePublish}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Publish {isMission ? 'Gig' : 'Drop'}
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Active Campaigns Section */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="h-5 w-5" style={{ color: PARTNER_COLOR }} />
          <h4 className="font-heading font-semibold text-white">Active Quest Lines & Gigs</h4>
        </div>

        {activeCampaigns.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-[#121212] border border-white/5">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Rocket className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">No active campaigns.</p>
            <p className="text-gray-500 text-xs mt-1">Launch a Drop to start tracking revenue.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#121212] border border-white/5 hover:border-white/10 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="h-14 w-14 rounded-lg bg-black/40 flex-shrink-0 overflow-hidden border border-white/10">
                  {campaign.thumbnail ? (
                    <img src={campaign.thumbnail} alt={campaign.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Title, Type & Reward/Commission */}
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-white truncate">{campaign.title}</h5>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ 
                        background: campaign.type === 'drop' ? `${PARTNER_COLOR}20` : '#A759D820',
                        color: campaign.type === 'drop' ? PARTNER_COLOR : '#A759D8'
                      }}
                    >
                      {campaign.type === 'drop' ? 'Quest Line' : 'Gig'}
                    </span>
                    {/* Show Reward (Drop) or Commission (Mission) */}
                    {campaign.type === 'drop' && campaign.reward_text && (
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                        style={{ borderColor: PARTNER_COLOR, color: PARTNER_COLOR }}
                      >
                        🎁 {campaign.reward_text}
                      </span>
                    )}
                    {campaign.type === 'mission' && campaign.commission_details && (
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                        style={{ borderColor: '#A759D8', color: '#A759D8' }}
                      >
                        💰 {campaign.commission_details}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4">
                  {/* Revenue */}
                  <div className="text-right hidden sm:block">
                    <p className="text-lg font-bold text-green-400">${campaign.revenue.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-500 flex items-center justify-end gap-1">
                      <DollarSign className="h-3 w-3" /> Revenue
                    </p>
                  </div>

                  {/* Scans */}
                  <div className="text-right hidden sm:block">
                    <p className="text-lg font-bold text-white">{campaign.scans}</p>
                    <p className="text-[10px] text-gray-500 flex items-center justify-end gap-1">
                      <Eye className="h-3 w-3" /> Scans
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Live</span>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditCampaign(campaign.id, campaign.title)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit campaign"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
