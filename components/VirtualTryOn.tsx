"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, RotateCcw, RotateCw, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

interface VirtualTryOnProps {
  open: boolean;
  onClose: () => void;
  productImageUrl: string;
  productName: string;
}

const VirtualTryOn: React.FC<VirtualTryOnProps> = ({
  open,
  onClose,
  productImageUrl,
  productName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarImageRef = useRef<HTMLImageElement | null>(null);
  const productImageRef = useRef<HTMLImageElement | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productScale, setProductScale] = useState(1);
  const [productX, setProductX] = useState(0);
  const [productY, setProductY] = useState(0);
  const [productRotation, setProductRotation] = useState(0);
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);

  // صور إنسان حقيقي متنوعة من Unsplash
  const avatarUrls = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&h=800&fit=crop", // رجل في تيشرت أبيض
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&h=800&fit=crop", // رجل آخر في قميص أبيض
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&h=800&fit=crop", // امرأة في قميص أبيض
  ];

  // تبديل الصورة وإعادة ضبط المنتج تلقائيًا
  const generateNewAvatar = () => {
    const newIndex = (currentAvatarIndex + 1) % avatarUrls.length;
    setCurrentAvatarIndex(newIndex);
    // إعادة ضبط المنتج تلقائيًا للصورة الجديدة
    setProductScale(0.8); // تصغير أولي للتناسب مع الصورة الجديدة
    setProductRotation(0);
    setTimeout(() => {
      if (canvasRef.current && productImageRef.current) {
        adjustProductPositionAutomatically();
      }
    }, 500); // تأخير قصير لتحميل الصورة
  };

  // ضبط الموضع والحجم تلقائيًا حسب الصورة
  const adjustProductPositionAutomatically = () => {
    if (!canvasRef.current || !productImageRef.current || !avatarImageRef.current) return;

    const canvas = canvasRef.current;
    const avatarSize = Math.min(canvas.width * 0.7, canvas.height * 0.8);
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = (canvas.height - avatarSize) / 2;

    // حساب baseScale بناءً على أبعاد الصورة الحقيقية (مش 512)
    const baseScale = avatarSize / avatarImageRef.current.naturalWidth;
    
    // تصغير الحجم حسب الصورة (عامل أصغر للصور الكبيرة)
    const scaledWidth = productImageRef.current.naturalWidth * 0.4 * productScale * baseScale; // خفضت إلى 0.4 للتصغير
    const scaledHeight = productImageRef.current.naturalHeight * 0.4 * productScale * baseScale;

    // position تلقائي: وسط الجذع (أسفل الرأس بنسبة 25-35% حسب الصورة)
    const centerX = avatarX + avatarSize * 0.5; // وسط أفقي
    const centerY = avatarY + avatarSize * 0.35; // أسفل الرأس للصدر
    setProductX(centerX - scaledWidth / 2);
    setProductY(centerY - scaledHeight / 2);

    drawCanvas();
  };

  // تحميل صورة الإنسان الحقيقي
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      const avatarUrl = avatarUrls[currentAvatarIndex];
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        avatarImageRef.current = img;
        // ضبط تلقائي عند تحميل الصورة الجديدة
        if (productImageRef.current) {
          adjustProductPositionAutomatically();
        } else {
          drawCanvas();
        }
        setIsLoading(false);
      };
      img.onerror = () => {
        setIsLoading(false);
        setError("فشل تحميل صورة الإنسان");
      };
      img.src = avatarUrl;
    }
  }, [open, currentAvatarIndex]);

  // تحميل صورة المنتج وإزالة الخلفية
  useEffect(() => {
    if (productImageUrl && open) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          productImageRef.current = img;
          if (avatarImageRef.current) adjustProductPositionAutomatically();
          return;
        }

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        
        tempCtx.drawImage(img, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          const isWhite = brightness > 240 && data[i + 3] > 200;
          
          if (isWhite) {
            data[i + 3] = 0;
          }
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        const processedImg = new Image();
        processedImg.onload = () => {
          productImageRef.current = processedImg;
          if (avatarImageRef.current) {
            adjustProductPositionAutomatically();
          }
        };
        processedImg.src = tempCanvas.toDataURL();
      };
      img.onerror = () => {
        setError("فشل تحميل صورة المنتج");
        setIsLoading(false);
      };
      img.src = productImageUrl;
    }
  }, [productImageUrl, open]);

  // رسم Canvas - scaling محسن حسب أبعاد الصورة الحقيقية
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رسم الإنسان الحقيقي
    if (avatarImageRef.current) {
      const avatarSize = Math.min(canvas.width * 0.7, canvas.height * 0.8);
      const avatarX = (canvas.width - avatarSize) / 2;
      const avatarY = (canvas.height - avatarSize) / 2;
      
      ctx.drawImage(avatarImageRef.current, avatarX, avatarY, avatarSize, avatarSize);
    }

    // رسم المنتج - scaling تلقائي حسب naturalWidth
    if (productImageRef.current && avatarImageRef.current) {
      const img = productImageRef.current;
      const avatarSize = Math.min(canvas.width * 0.7, canvas.height * 0.8);
      
      // baseScale حسب أبعاد الصورة الحقيقية للدقة
      const baseScale = avatarSize / avatarImageRef.current.naturalWidth;
      const scaledWidth = img.naturalWidth * 0.4 * productScale * baseScale; // تصغير أكثر (0.4)
      const scaledHeight = img.naturalHeight * 0.4 * productScale * baseScale;

      ctx.save();
      
      ctx.translate(productX + scaledWidth / 2, productY + scaledHeight / 2);
      ctx.rotate((productRotation * Math.PI) / 180);
      ctx.translate(-scaledWidth / 2, -scaledHeight / 2);

      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.globalAlpha = 0.98;
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      
      ctx.restore();
      ctx.shadowColor = "transparent";
    }
  };

  useEffect(() => {
    if (open) drawCanvas();
  }, [productScale, productX, productY, productRotation, open]);

  useEffect(() => {
    if (open) {
      const updateCanvasSize = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          setTimeout(updateCanvasSize, 50);
          return;
        }
        
        const container = canvas.parentElement;
        if (container && container.clientWidth > 0 && container.clientHeight > 0) {
          const width = container.clientWidth;
          const height = container.clientHeight || 600;
          
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            if (avatarImageRef.current && productImageRef.current) {
              adjustProductPositionAutomatically();
            } else {
              drawCanvas();
            }
          }
        } else {
          setTimeout(updateCanvasSize, 50);
        }
      };

      setTimeout(updateCanvasSize, 200);
      updateCanvasSize();
    }
  }, [open]);

  const handleZoomIn = () => setProductScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setProductScale(prev => Math.max(prev - 0.1, 0.3)); // حد أدنى أصغر
  const handleRotateLeft = () => setProductRotation(prev => prev - 5);
  const handleRotateRight = () => setProductRotation(prev => prev + 5);

  const handleReset = () => {
    setProductScale(0.8); // تصغير افتراضي
    setProductRotation(0);
    adjustProductPositionAutomatically();
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (productImageRef.current && avatarImageRef.current) {
      const avatarSize = Math.min(canvas.width * 0.7, canvas.height * 0.8);
      const baseScale = avatarSize / avatarImageRef.current.naturalWidth;
      const scaledWidth = productImageRef.current.naturalWidth * 0.4 * productScale * baseScale;
      const scaledHeight = productImageRef.current.naturalHeight * 0.4 * productScale * baseScale;
      
      if (x >= productX && x <= productX + scaledWidth && y >= productY && y <= productY + scaledHeight) {
        setIsDragging(true);
        setDragStart({ x: x - productX, y: y - productY });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;

    setProductX(Math.max(0, Math.min(x, canvas.width - 100)));
    setProductY(Math.max(0, Math.min(y, canvas.height - 100)));
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-center">
            التجربة الافتراضية - {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full bg-white flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-gray-800 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
                <p>جاري التحميل...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-gray-800 text-center p-6">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={onClose} variant="outline">إغلاق</Button>
              </div>
            </div>
          )}

          <div className="relative w-full" style={{ minHeight: "600px", height: "600px" }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ backgroundColor: "#ffffff", display: "block", width: "100%", height: "100%" }}
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-600">
              <p>اسحب المنتج لتحريكه • اضغط على صورة جديدة للتلقائي اللبس + تصغير الحجم!</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={generateNewAvatar} variant="outline" size="sm" title="صورة جديدة (تلقائي اللبس)">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={handleZoomOut} variant="outline" size="sm" title="تصغير">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button onClick={handleZoomIn} variant="outline" size="sm" title="تكبير">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button onClick={handleRotateLeft} variant="outline" size="sm" title="دوران يسار">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button onClick={handleRotateRight} variant="outline" size="sm" title="دوران يمين">
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm" title="إعادة تعيين (تلقائي)">
                إعادة
              </Button>
              <Button onClick={onClose} variant="outline">
                <X className="w-4 h-4 mr-2" />
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualTryOn;