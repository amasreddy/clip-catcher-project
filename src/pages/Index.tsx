
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Download, Video, Music, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoFormat {
  format_id: string;
  format_note?: string;
  ext: string;
  resolution?: string;
  filesize?: number;
  url: string;
}

interface VideoInfo {
  title: string;
  formats: VideoFormat[];
}

const Index = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const { toast } = useToast();

  // Replace with your Render.com backend URL when deployed
  const BACKEND_URL = "http://localhost:5000"; // Change this to your Render URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/formats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch video information");
      }

      const data = await response.json();
      setVideoInfo(data);
      toast({
        title: "Success",
        description: "Video information loaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch video information. Make sure the URL is valid and your backend is running.",
        variant: "destructive",
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (formatId: string) => {
    const downloadUrl = `${BACKEND_URL}/api/download?url=${encodeURIComponent(url)}&format_id=${formatId}`;
    window.open(downloadUrl, '_blank');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getFormatIcon = (format: VideoFormat) => {
    if (format.resolution && format.resolution !== "audio only") {
      return <Video className="h-4 w-4" />;
    }
    return <Music className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">YouTube Downloader</h1>
          <p className="text-gray-600">Download your favorite YouTube videos in various formats</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter YouTube URL</CardTitle>
            <CardDescription>
              Paste the YouTube video URL below to get download options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">YouTube URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Get Download Options
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {videoInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                {videoInfo.title}
              </CardTitle>
              <CardDescription>
                Available download formats for this video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {videoInfo.formats.slice(0, 10).map((format) => (
                  <div
                    key={format.format_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getFormatIcon(format)}
                      <div>
                        <div className="font-medium">
                          {format.resolution || "Audio Only"} - {format.ext.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format.format_note && `${format.format_note} • `}
                          {formatFileSize(format.filesize)}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(format.format_id)}
                      className="shrink-0"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Important:</strong> Make sure your backend is running and update the BACKEND_URL 
              in the code to your Render.com deployment URL. This tool is for educational purposes only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
