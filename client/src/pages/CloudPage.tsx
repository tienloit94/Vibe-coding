import { useEffect, useState, useRef } from 'react';
import { useNoteStore } from '../store/noteStore';
// import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Plus, Pin, Trash2, X, Image as ImageIcon, 
  CloudIcon 
} from 'lucide-react';
import { toast } from 'sonner';
// import { useTranslation } from 'react-i18next';

export default function CloudPage() {
  // const { t } = useTranslation();
  const { notes, fetchNotes, createNote, deleteNote, togglePin } = useNoteStore();
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error('Tối đa 5 ảnh');
      return;
    }

    setSelectedImages([...selectedImages, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateNote = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      toast.error('Vui lòng nhập nội dung hoặc chọn ảnh');
      return;
    }

    try {
      await createNote(content, selectedImages);
      setContent('');
      setSelectedImages([]);
      setImagePreviews([]);
      toast.success('Đã lưu ghi chú');
    } catch (error) {
      toast.error('Không thể lưu ghi chú');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      toast.success('Đã xóa ghi chú');
    } catch (error) {
      toast.error('Không thể xóa ghi chú');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await togglePin(id);
    } catch (error) {
      toast.error('Không thể ghim ghi chú');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <CloudIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Cloud của tôi
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Lưu trữ ghi chú, ảnh cá nhân của bạn
            </p>
          </div>
        </div>

        {/* Create Note */}
        <Card className="p-4 mb-6 dark:bg-gray-800 dark:border-gray-700">
          <Textarea
            placeholder="Viết ghi chú của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-3 min-h-[100px] dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Thêm ảnh
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button onClick={handleCreateNote}>
              <Plus className="w-4 h-4 mr-2" />
              Lưu ghi chú
            </Button>
          </div>
        </Card>

        {/* Notes List */}
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-4">
            {notes.map((note) => (
              <Card
                key={note._id}
                className={`p-4 ${
                  note.isPinned 
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'dark:bg-gray-800 dark:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(note.createdAt).toLocaleString('vi-VN')}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleTogglePin(note._id)}
                      className={note.isPinned ? 'text-blue-600 dark:text-blue-400' : ''}
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-900 dark:text-white whitespace-pre-wrap mb-3">
                  {note.content}
                </p>

                {note.images && note.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {note.images.map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000${img}`}
                        alt={`Note image ${index}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </Card>
            ))}

            {notes.length === 0 && (
              <div className="text-center py-12">
                <CloudIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Chưa có ghi chú nào. Tạo ghi chú đầu tiên của bạn!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
