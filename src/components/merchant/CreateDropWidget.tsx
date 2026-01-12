import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Upload, Send, Image as ImageIcon, X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const stockImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=300&fit=crop",
];

export function CreateDropWidget() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasMedia, setHasMedia] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Auto-fill based on prompt
    const generatedTitle = aiPrompt.includes("happy hour") 
      ? "Happy Hour Special 🍹" 
      : aiPrompt.includes("lunch")
      ? "Power Lunch Deal 🥗"
      : `${aiPrompt.charAt(0).toUpperCase() + aiPrompt.slice(1)} Special ✨`;
    
    const generatedDescription = `Don't miss our exclusive ${aiPrompt}! Limited time offer for VibeCheck members. Experience the best of what we have to offer at an unbeatable price.`;
    
    setTitle(generatedTitle);
    setDescription(generatedDescription);
    setHasMedia(true);
    setIsGenerating(false);
    setAiPrompt("");
    toast.success("Campaign generated with AI!");
  };

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDescription("🎉 Limited time offer! Get an exclusive deal at our location. Perfect for foodies and adventure seekers alike. Don't miss out on this amazing opportunity! #VibeCheck #LocalDeals");
    setIsGenerating(false);
    toast.success("Draft generated with AI!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl bg-slate-900 border border-white/10 shadow-xl h-full overflow-hidden"
    >
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-vibe-teal/20 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-vibe-teal" />
          <h4 className="font-heading font-semibold text-white">Partner Studio</h4>
        </div>
        
        <p className="text-sm text-slate-400 mb-4">
          Create your next viral campaign
        </p>

        {/* AI Campaign Builder */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-vibe-teal/20 to-vibe-green/10 border border-vibe-teal/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-vibe-teal/30 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-vibe-teal" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white">AI Campaign Builder</h5>
              <p className="text-xs text-slate-400">Let AI create your promo</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="What do you want to promote? (e.g., Happy Hour)"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 rounded-lg bg-slate-800/80 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-vibe-teal/50"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleAIGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                size="sm"
                className="bg-vibe-teal hover:bg-vibe-teal/90 text-white"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Generate Draft with AI Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mb-4">
          <Button
            variant="outline"
            className="w-full border-vibe-teal/30 hover:border-vibe-teal hover:bg-vibe-teal/10 text-slate-300"
            onClick={handleGenerateDraft}
            disabled={isGenerating}
          >
            <Wand2 className={`mr-2 h-4 w-4 text-vibe-teal ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : "Generate Draft with AI"}
          </Button>
        </motion.div>

        {/* Title input */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Campaign title..."
            className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-vibe-teal/50"
          />
        </div>

        {/* Description input */}
        <div className="mb-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your campaign description... ✨"
            className="w-full h-24 rounded-xl bg-slate-800/50 border border-slate-700 p-3 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-vibe-teal/50 placeholder:text-slate-500"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">{description.length}/2200</span>
          </div>
        </div>

        {/* Media dropzone */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`relative rounded-xl border-2 border-dashed ${hasMedia ? 'border-vibe-teal bg-vibe-teal/5' : 'border-slate-700 bg-slate-800/30'} p-6 text-center cursor-pointer transition-colors hover:border-vibe-teal/50`}
          onClick={() => setHasMedia(!hasMedia)}
        >
          {hasMedia ? (
            <div className="flex items-center justify-center gap-2">
              <ImageIcon className="h-5 w-5 text-vibe-teal" />
              <span className="text-sm font-medium text-vibe-teal">1 image added</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setHasMedia(false); }}
                className="ml-2 p-1 rounded-full hover:bg-slate-700"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-medium text-slate-400">Drop media here</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, MP4 up to 50MB</p>
            </>
          )}
        </motion.div>

        {/* Publish Drop button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-vibe-teal to-vibe-green hover:opacity-90 text-white font-semibold" 
            disabled={!title && !description && !hasMedia}
          >
            <Send className="mr-2 h-4 w-4" />
            Publish Drop
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Mobile FAB version
export function CreateDropFAB() {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-4 md:hidden w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-40 gradient-partner"
    >
      <span className="text-white text-3xl font-light">+</span>
    </motion.button>
  );
}
