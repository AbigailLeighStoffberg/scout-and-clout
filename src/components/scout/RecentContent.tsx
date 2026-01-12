import { useEffect } from "react";
import { Video } from "lucide-react";

export function RecentContent() {
  useEffect(() => {
    // Load Elfsight script
    const script = document.createElement("script");
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://elfsightcdn.com/platform.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold flex items-center gap-2 text-white">
          <Video className="h-5 w-5 text-[#18C5DC]" />
          Recent Content
        </h2>
      </div>
      
      <div className="rounded-xl overflow-hidden bg-[#1A1A1A] border border-white/10 p-4">
        <div 
          className="elfsight-app-177d35c3-95a5-4b6d-a053-edbfb93a11ce" 
          data-elfsight-app-lazy
        />
      </div>
    </div>
  );
}
