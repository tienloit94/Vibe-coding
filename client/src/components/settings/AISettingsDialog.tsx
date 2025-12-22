import { useState, useEffect } from 'react';
import { Settings, Key, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { getApiUrl } from '@/lib/config';

export default function AISettingsDialog() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkAIKey = async () => {
    setChecking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('api/ai/check-key'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasKey(response.data.hasKey);
    } catch (error) {
      console.error('Failed to check AI key:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (open) {
      checkAIKey();
    }
  }, [open]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Vui lòng nhập API key');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        getApiUrl('api/ai/set-key'),
        { apiKey },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('API key đã được cập nhật. AI Assistant sẽ trả lời thông minh hơn!');

      setHasKey(true);
      setApiKey('');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể lưu API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start space-x-2">
          <Settings className="h-4 w-4" />
          <span>Cài đặt AI</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Cài đặt OpenAI (ChatGPT)</span>
          </DialogTitle>
          <DialogDescription>
            Cấu hình API key để AI Assistant có thể trả lời thông minh hơn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-sm font-medium">Trạng thái API Key</span>
            {checking ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : hasKey ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Đã cấu hình</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Chưa cấu hình</span>
              </div>
            )}
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-proj-..." 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Lấy API key tại:{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          {/* Info */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Lưu ý:</strong> API key được lưu trữ trong bộ nhớ server. 
              Khi restart server, bạn cần nhập lại API key.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Khi kích hoạt ChatGPT, bạn có thể:</p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
              <li>✅ Chat với AI thông minh (GPT-3.5 Turbo)</li>
              <li>✅ Hỏi về thời gian, ngày tháng, tính toán</li>
              <li>✅ Trò chuyện tự nhiên bằng tiếng Việt</li>
              <li>✅ Nhận câu trả lời chi tiết và chính xác</li>
              <li>✅ Giải thích code, viết văn bản, dịch thuật</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleSaveKey} 
            disabled={loading || !apiKey.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu API Key'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
