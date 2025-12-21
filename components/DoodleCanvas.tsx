
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useEffect } from 'react';
import { TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DoodleCanvasProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  initialImage?: string | null;
}

export const DoodleCanvas: React.FC<DoodleCanvasProps> = ({ onSave, onCancel, initialImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Setup canvas visuals
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#2563eb'; // Blue ink

        if (initialImage) {
            const img = new Image();
            img.src = initialImage;
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                setIsEmpty(false);
            };
        }
      }
    }
  }, [initialImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    setIsEmpty(false);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.closePath();
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="sketch-modal bg-white w-full max-w-sm flex flex-col overflow-hidden relative">
         {/* Header */}
         <div className="bg-zinc-100 p-4 border-b border-zinc-200 flex justify-between items-center">
            <h3 className="font-hand text-xl font-bold text-zinc-800">Draw Your Victory!</h3>
            <button onClick={onCancel} className="p-1 hover:bg-zinc-200 rounded-full">
                <XMarkIcon className="w-6 h-6 text-zinc-500" />
            </button>
         </div>

         {/* Canvas Container */}
         <div className="p-4 bg-paper relative">
            <div className="border-2 border-dashed border-zinc-300 rounded-lg overflow-hidden bg-white shadow-inner cursor-crosshair touch-none">
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    className="w-full h-auto block touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <p className="text-center font-hand text-xs text-zinc-400 mt-2">
                This doodle will be stamped on your opponent when you win!
            </p>
         </div>

         {/* Footer Actions */}
         <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-4">
            <button 
                onClick={clearCanvas} 
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors"
            >
                <TrashIcon className="w-5 h-5" />
                <span className="font-hand font-bold text-sm">Clear</span>
            </button>
            <button 
                onClick={handleSave} 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-transform active:scale-95"
            >
                <CheckIcon className="w-5 h-5" />
                <span className="font-hand font-bold text-lg">Save Doodle</span>
            </button>
         </div>
      </div>
    </div>
  );
};
