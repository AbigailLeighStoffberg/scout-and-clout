import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Upload, 
  Send, 
  Image as ImageIcon, 
  X, 
  Wand2, 
  Smartphone, 
  Hash, 
  Clock, 
  Link2, 
  ChevronDown,
  Instagram,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/glass-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export function InfluencerWorkbench() {
  const [isOpen, setIsOpen] = useState(true);
  const [caption, setCaption] = useState("");
  const [hasMedia, setHasMedia] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>(["Instagram"]);
  const [scheduledTime, setScheduledTime] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);

  const networks = [
    { name: "Instagram", icon: Instagram, color: "from-purple-500 to-pink-500" },
    { name: "TikTok", icon: TikTokIcon, color: "from-black to-gray-800" },
    { name: "X", icon: XIcon, color: "from-gray-700 to-black" },
  ];

  const suggestedHashtags = ["#VibeCheck", "#LocalFinds", "#FoodieAdventure", "#HiddenGem", "#WeekendVibes", "#SupportLocal"];

  const toggleNetwork = (network: string) => {
    setSelectedNetworks(prev => 
      prev.includes(network) 
        ? prev.filter(n => n !== network)
        : [...prev, network]
    );
  };

  const addHashtag = (tag: string) => {
    if (!hashtags.includes(tag)) {
      setHashtags(prev => [...prev, tag]);
      setCaption(prev => prev + " " + tag);
    }
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCaption("Just discovered the most amazing hidden gem in the city! 🌟✨ The vibes are immaculate and the food is next level. You NEED to check this out! #VibeCheck #LocalFinds #FoodieAdventure");
    setPreviewImage("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop");
    setHasMedia(true);
    setHashtags(["#VibeCheck", "#LocalFinds", "#FoodieAdventure"]);
    setIsGenerating(false);
    toast.success("Draft generated with AI!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setHasMedia(true);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <GlassCard className="overflow-hidden relative">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#A759D8]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#DB529F]/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          {/* Header with collapse toggle */}
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between mb-4 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #A759D8, #DB529F)' }}>
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-heading font-semibold text-white">Influencer Workbench</h4>
                  <p className="text-xs text-muted-foreground">Create, schedule & analyze your content</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid lg:grid-cols-3 gap-6 pt-2">
                    {/* Column 1: Content Creation */}
                    <div className="flex flex-col gap-3">
                      <h5 className="text-sm font-medium text-[#18C5DC] flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Create Content
                      </h5>
                      
                      {/* Caption input */}
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Caption</label>
                        <textarea
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Write your caption here... ✨"
                          className="w-full h-24 rounded-lg bg-slate-800/50 border border-slate-700 p-3 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#A759D8]/50 placeholder:text-slate-500"
                        />
                        <span className="text-xs text-slate-500">{caption.length}/2200</span>
                      </div>

                      {/* Media dropzone */}
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Media</label>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="content-media-upload"
                        />
                        <motion.label
                          htmlFor="content-media-upload"
                          whileHover={{ scale: 1.01 }}
                          className={`relative rounded-lg border-2 border-dashed h-10 ${hasMedia ? 'border-[#A759D8] bg-[#A759D8]/5' : 'border-slate-700 bg-slate-800/30'} text-center cursor-pointer transition-colors hover:border-[#A759D8]/50 flex items-center justify-center`}
                        >
                          {hasMedia ? (
                            <div className="flex items-center justify-center gap-2">
                              <ImageIcon className="h-4 w-4 text-[#18C5DC]" />
                              <span className="text-sm font-medium text-[#18C5DC]">1 image added</span>
                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHasMedia(false); setPreviewImage(null); }}
                                className="ml-2 p-1 rounded-full hover:bg-slate-700"
                              >
                                <X className="h-3 w-3 text-slate-400" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2 text-slate-500" />
                              <p className="text-xs text-slate-400">Drop media here</p>
                            </>
                          )}
                        </motion.label>
                      </div>

                      {/* AI Generate Button */}
                      <Button
                        variant="outline"
                        className="w-full h-10 border-[#A759D8]/30 hover:border-[#A759D8] hover:bg-[#A759D8]/10 text-slate-300"
                        onClick={handleGenerateWithAI}
                        disabled={isGenerating}
                      >
                        <Wand2 className={`mr-2 h-4 w-4 text-[#18C5DC] ${isGenerating ? "animate-spin" : ""}`} />
                        {isGenerating ? "Generating..." : "Generate with AI"}
                      </Button>
                    </div>

                    {/* Column 2: Publishing Options */}
                    <div className="flex flex-col gap-3">
                      <h5 className="text-sm font-medium text-[#18C5DC] flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Publishing
                      </h5>

                      {/* Network selection */}
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Platforms</label>
                        <div className="flex flex-wrap gap-2">
                          {networks.map((network) => (
                            <button
                              key={network.name}
                              onClick={() => toggleNetwork(network.name)}
                              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                selectedNetworks.includes(network.name)
                                  ? `bg-gradient-to-r ${network.color} text-white`
                                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                              }`}
                            >
                              <network.icon className="h-3.5 w-3.5" />
                              {network.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hashtag suggestions */}
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          Trending Hashtags
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {suggestedHashtags.slice(0, 4).map((tag) => (
                            <button
                              key={tag}
                              onClick={() => addHashtag(tag)}
                              className={`rounded-full px-2 py-0.5 text-xs transition-all ${
                                hashtags.includes(tag)
                                  ? "bg-[#A759D8]/20 text-[#18C5DC]"
                                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Schedule */}
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Schedule Post
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full h-10 rounded-lg bg-slate-800/50 border border-slate-700 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#A759D8]/50"
                        />
                      </div>

                      {/* Link tracking */}
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          Affiliate Link
                        </label>
                        <div className="h-10 rounded-lg bg-slate-800/50 border border-slate-700 px-3 text-xs text-[#18C5DC] truncate flex items-center">
                          vibecheck.app/r/yourname/tasty-bites
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Preview */}
                    <div className="flex flex-col gap-3">
                      <h5 className="text-sm font-medium text-[#18C5DC] flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Preview
                      </h5>
                      
                      {/* Phone mockup - smaller */}
                      <div className="relative mx-auto w-full max-w-[160px]">
                        <div className="rounded-[1.5rem] bg-slate-800 p-1.5 border-2 border-slate-700 shadow-xl">
                          <div className="rounded-[1.25rem] bg-slate-900 overflow-hidden aspect-[9/16]">
                            <div className="h-4 bg-slate-800 flex items-center justify-center">
                              <div className="w-8 h-2 rounded-full bg-slate-700" />
                            </div>
                            
                            <div className="p-1.5">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="h-5 w-5 rounded-full gradient-influencer" />
                                <div>
                                  <p className="text-[8px] text-white font-medium">@yourhandle</p>
                                  <p className="text-[6px] text-slate-500">Just now</p>
                                </div>
                              </div>
                              
                              <div className={`aspect-square rounded-md mb-1.5 flex items-center justify-center overflow-hidden ${!previewImage ? 'bg-slate-800' : ''}`}>
                                {previewImage ? (
                                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[8px] text-slate-600">No media</span>
                                )}
                              </div>
                              
                              <p className="text-[8px] text-white line-clamp-2">
                                {caption || "Your caption..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Post Now button - full width outside grid */}
                  <Button 
                    className="w-full h-12 text-white font-semibold mt-4" 
                    style={{ background: "linear-gradient(to right, #A759D8, #DB529F)" }}
                    disabled={!caption && !hasMedia}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {scheduledTime ? "Schedule" : "Post Now"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </div>
      </GlassCard>
    </Collapsible>
  );
}
