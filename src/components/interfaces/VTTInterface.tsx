import VTTCanvas from "@/components/vtt/VTTCanvas";
import VTTToolbar from "@/components/vtt/VTTToolbar";
import VTTSidebar from "@/components/vtt/VTTSidebar";

export default function VTTInterface() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-terminal-bg-dark">
      {/* Left toolbar */}
      <VTTToolbar />

      {/* Main canvas area */}
      <div className="flex-1 relative min-w-0">
        <VTTCanvas />
      </div>

      {/* Right sidebar */}
      <VTTSidebar />
    </div>
  );
}
