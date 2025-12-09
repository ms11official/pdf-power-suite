import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, Rect, Circle, Line, IText, FabricImage, PencilBrush, Textbox } from "fabric";

export interface CanvasOverlayRef {
  addText: () => void;
  addRect: () => void;
  addCircle: () => void;
  addLine: () => void;
  addImage: (file: File) => void;
  setDrawingMode: (enabled: boolean) => void;
  setHighlightMode: (enabled: boolean) => void;
  setEraserMode: (enabled: boolean) => void;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setBold: () => void;
  setItalic: () => void;
  setUnderline: () => void;
  setAlign: (align: string) => void;
  clear: () => void;
  getCanvas: () => FabricCanvas | null;
  addSignature: () => void;
  addStamp: (type: string) => void;
  addWatermark: (text: string) => void;
  addRedaction: () => void;
  addComment: () => void;
  addPageNumber: (pageNum: number) => void;
  setColor: (color: string) => void;
  copySelected: () => void;
  paste: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  flipHorizontal: () => void;
  rotate90: () => void;
  hasSelection: () => boolean;
  getCanvasDataUrl: () => string | null;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setStrokeWidth: (width: number) => void;
  exportAnnotations: () => string;
  importAnnotations: (json: string) => void;
}

interface CanvasOverlayProps {
  width: number;
  height: number;
  activeTool: string;
  activeColor: string;
  fontSize: number;
  fontFamily: string;
  strokeWidth: number;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
  onContextMenu?: (x: number, y: number, hasSelection: boolean) => void;
}

export const CanvasOverlay = forwardRef<CanvasOverlayRef, CanvasOverlayProps>(
  ({ width, height, activeTool, activeColor, fontSize, fontFamily, strokeWidth, onHistoryChange, onContextMenu }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<FabricCanvas | null>(null);
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const isUndoRedoRef = useRef<boolean>(false);
    const clipboardRef = useRef<any>(null);
    const currentColorRef = useRef<string>(activeColor);
    const currentFontSizeRef = useRef<number>(fontSize);
    const currentFontFamilyRef = useRef<string>(fontFamily);
    const currentStrokeWidthRef = useRef<number>(strokeWidth);

    // Update refs when props change
    useEffect(() => {
      currentColorRef.current = activeColor;
    }, [activeColor]);

    useEffect(() => {
      currentFontSizeRef.current = fontSize;
    }, [fontSize]);

    useEffect(() => {
      currentFontFamilyRef.current = fontFamily;
    }, [fontFamily]);

    useEffect(() => {
      currentStrokeWidthRef.current = strokeWidth;
      if (fabricRef.current?.freeDrawingBrush) {
        fabricRef.current.freeDrawingBrush.width = strokeWidth;
      }
    }, [strokeWidth]);

    const saveHistory = useCallback(() => {
      if (isUndoRedoRef.current || !fabricRef.current) return;
      
      const json = JSON.stringify(fabricRef.current.toJSON());
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(json);
      historyIndexRef.current = historyRef.current.length - 1;
      
      onHistoryChange(historyIndexRef.current > 0, false);
    }, [onHistoryChange]);

    useEffect(() => {
      if (!canvasRef.current || fabricRef.current) return;

      const canvas = new FabricCanvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "transparent",
        selection: true,
      });

      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#000000";
      canvas.freeDrawingBrush.width = currentStrokeWidthRef.current;

      canvas.on("object:added", saveHistory);
      canvas.on("object:modified", saveHistory);
      canvas.on("object:removed", saveHistory);

      fabricRef.current = canvas;
      saveHistory();

      return () => {
        canvas.dispose();
        fabricRef.current = null;
      };
    }, []);

    useEffect(() => {
      if (!fabricRef.current) return;
      fabricRef.current.setDimensions({ width, height });
    }, [width, height]);

    useEffect(() => {
      if (!fabricRef.current) return;
      
      const canvas = fabricRef.current;
      const color = currentColorRef.current;
      const sw = currentStrokeWidthRef.current;
      
      switch (activeTool) {
        case "draw":
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush!.color = color;
          canvas.freeDrawingBrush!.width = sw;
          break;
        case "highlight":
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush!.color = "rgba(255, 255, 0, 0.4)";
          canvas.freeDrawingBrush!.width = 20;
          break;
        case "eraser":
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush!.color = "#ffffff";
          canvas.freeDrawingBrush!.width = 20;
          break;
        default:
          canvas.isDrawingMode = false;
          break;
      }
    }, [activeTool]);

    useImperativeHandle(ref, () => ({
      addText: () => {
        if (!fabricRef.current) return;
        const text = new IText("Type here...", {
          left: 100,
          top: 100,
          fontSize: currentFontSizeRef.current,
          fill: currentColorRef.current,
          fontFamily: currentFontFamilyRef.current,
        });
        fabricRef.current.add(text);
        fabricRef.current.setActiveObject(text);
        text.enterEditing();
      },

      addRect: () => {
        if (!fabricRef.current) return;
        const rect = new Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 80,
          fill: "transparent",
          stroke: currentColorRef.current,
          strokeWidth: currentStrokeWidthRef.current,
        });
        fabricRef.current.add(rect);
        fabricRef.current.setActiveObject(rect);
      },

      addCircle: () => {
        if (!fabricRef.current) return;
        const circle = new Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: "transparent",
          stroke: currentColorRef.current,
          strokeWidth: currentStrokeWidthRef.current,
        });
        fabricRef.current.add(circle);
        fabricRef.current.setActiveObject(circle);
      },

      addLine: () => {
        if (!fabricRef.current) return;
        const line = new Line([50, 50, 200, 50], {
          stroke: currentColorRef.current,
          strokeWidth: currentStrokeWidthRef.current,
        });
        fabricRef.current.add(line);
        fabricRef.current.setActiveObject(line);
      },

      addImage: (file: File) => {
        if (!fabricRef.current) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgElement = new Image();
          imgElement.src = e.target?.result as string;
          imgElement.onload = () => {
            const img = new FabricImage(imgElement, {
              left: 100,
              top: 100,
              scaleX: 0.5,
              scaleY: 0.5,
            });
            fabricRef.current?.add(img);
            fabricRef.current?.setActiveObject(img);
          };
        };
        reader.readAsDataURL(file);
      },

      setDrawingMode: (enabled: boolean) => {
        if (!fabricRef.current) return;
        fabricRef.current.isDrawingMode = enabled;
        if (enabled) {
          fabricRef.current.freeDrawingBrush!.color = currentColorRef.current;
          fabricRef.current.freeDrawingBrush!.width = currentStrokeWidthRef.current;
        }
      },

      setHighlightMode: (enabled: boolean) => {
        if (!fabricRef.current) return;
        fabricRef.current.isDrawingMode = enabled;
        if (enabled) {
          fabricRef.current.freeDrawingBrush!.color = "rgba(255, 255, 0, 0.4)";
          fabricRef.current.freeDrawingBrush!.width = 20;
        }
      },

      setEraserMode: (enabled: boolean) => {
        if (!fabricRef.current) return;
        fabricRef.current.isDrawingMode = enabled;
        if (enabled) {
          fabricRef.current.freeDrawingBrush!.color = "#ffffff";
          fabricRef.current.freeDrawingBrush!.width = 20;
        }
      },

      deleteSelected: () => {
        if (!fabricRef.current) return;
        const activeObjects = fabricRef.current.getActiveObjects();
        activeObjects.forEach((obj) => fabricRef.current?.remove(obj));
        fabricRef.current.discardActiveObject();
        fabricRef.current.renderAll();
      },

      undo: () => {
        if (!fabricRef.current || historyIndexRef.current <= 0) return;
        isUndoRedoRef.current = true;
        historyIndexRef.current--;
        fabricRef.current.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
          fabricRef.current?.renderAll();
          isUndoRedoRef.current = false;
          onHistoryChange(
            historyIndexRef.current > 0,
            historyIndexRef.current < historyRef.current.length - 1
          );
        });
      },

      redo: () => {
        if (!fabricRef.current || historyIndexRef.current >= historyRef.current.length - 1) return;
        isUndoRedoRef.current = true;
        historyIndexRef.current++;
        fabricRef.current.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
          fabricRef.current?.renderAll();
          isUndoRedoRef.current = false;
          onHistoryChange(
            historyIndexRef.current > 0,
            historyIndexRef.current < historyRef.current.length - 1
          );
        });
      },

      canUndo: () => historyIndexRef.current > 0,
      canRedo: () => historyIndexRef.current < historyRef.current.length - 1,

      setBold: () => {
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject && activeObject.type === "i-text") {
          const textObj = activeObject as IText;
          textObj.set("fontWeight", textObj.fontWeight === "bold" ? "normal" : "bold");
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      setItalic: () => {
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject && activeObject.type === "i-text") {
          const textObj = activeObject as IText;
          textObj.set("fontStyle", textObj.fontStyle === "italic" ? "normal" : "italic");
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      setUnderline: () => {
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject && activeObject.type === "i-text") {
          const textObj = activeObject as IText;
          textObj.set("underline", !textObj.underline);
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      setAlign: (align: string) => {
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject && activeObject.type === "i-text") {
          const textObj = activeObject as IText;
          textObj.set("textAlign", align);
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      clear: () => {
        if (!fabricRef.current) return;
        fabricRef.current.clear();
        fabricRef.current.backgroundColor = "transparent";
        fabricRef.current.renderAll();
        historyRef.current = [];
        historyIndexRef.current = -1;
        saveHistory();
      },

      getCanvas: () => fabricRef.current,

      addSignature: () => {
        if (!fabricRef.current) return;
        const signatureText = new IText("Sign Here", {
          left: 100,
          top: 100,
          fontSize: 24,
          fill: "#1a1a2e",
          fontFamily: "Brush Script MT, cursive",
          fontStyle: "italic",
        });
        fabricRef.current.add(signatureText);
        fabricRef.current.setActiveObject(signatureText);
        signatureText.enterEditing();
      },

      addStamp: (type: string) => {
        if (!fabricRef.current) return;
        const stampColors: Record<string, string> = {
          approved: "#22c55e",
          rejected: "#ef4444",
          draft: "#f59e0b",
          confidential: "#dc2626",
        };
        const color = stampColors[type] || "#6366f1";
        
        const stampRect = new Rect({
          left: 100,
          top: 100,
          width: 120,
          height: 40,
          fill: "transparent",
          stroke: color,
          strokeWidth: 3,
          rx: 5,
          ry: 5,
        });
        
        const stampText = new IText(type.toUpperCase(), {
          left: 110,
          top: 108,
          fontSize: 18,
          fill: color,
          fontFamily: "Arial",
          fontWeight: "bold",
        });
        
        fabricRef.current.add(stampRect);
        fabricRef.current.add(stampText);
      },

      addWatermark: (text: string) => {
        if (!fabricRef.current) return;
        const watermark = new Textbox(text || "WATERMARK", {
          left: width / 2 - 100,
          top: height / 2 - 20,
          width: 200,
          fontSize: 32,
          fill: "rgba(150, 150, 150, 0.3)",
          fontFamily: "Arial",
          fontWeight: "bold",
          textAlign: "center",
          angle: -30,
          selectable: true,
        });
        fabricRef.current.add(watermark);
        fabricRef.current.setActiveObject(watermark);
      },

      addRedaction: () => {
        if (!fabricRef.current) return;
        const redactRect = new Rect({
          left: 100,
          top: 100,
          width: 150,
          height: 20,
          fill: "#000000",
          stroke: "#000000",
          strokeWidth: 1,
        });
        fabricRef.current.add(redactRect);
        fabricRef.current.setActiveObject(redactRect);
      },

      addComment: () => {
        if (!fabricRef.current) return;
        const commentBg = new Rect({
          left: 100,
          top: 100,
          width: 180,
          height: 80,
          fill: "#fef3c7",
          stroke: "#f59e0b",
          strokeWidth: 1,
          rx: 4,
          ry: 4,
        });
        
        const commentText = new IText("Add comment...", {
          left: 108,
          top: 108,
          fontSize: 12,
          fill: "#78350f",
          fontFamily: "Arial",
          width: 164,
        });
        
        fabricRef.current.add(commentBg);
        fabricRef.current.add(commentText);
        fabricRef.current.setActiveObject(commentText);
        commentText.enterEditing();
      },

      addPageNumber: (pageNum: number) => {
        if (!fabricRef.current) return;
        const pageText = new IText(`Page ${pageNum}`, {
          left: width / 2 - 30,
          top: height - 30,
          fontSize: 12,
          fill: "#666666",
          fontFamily: "Arial",
        });
        fabricRef.current.add(pageText);
      },

      setColor: (color: string) => {
        currentColorRef.current = color;
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject) {
          if (activeObject.type === "i-text" || activeObject.type === "textbox") {
            activeObject.set("fill", color);
          } else if (activeObject.type === "path") {
            activeObject.set("stroke", color);
          } else {
            activeObject.set("stroke", color);
          }
          fabricRef.current.renderAll();
          saveHistory();
        }
        if (fabricRef.current.freeDrawingBrush) {
          fabricRef.current.freeDrawingBrush.color = color;
        }
      },

      setFontSize: (size: number) => {
        currentFontSizeRef.current = size;
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject && (activeObject.type === "i-text" || activeObject.type === "textbox")) {
          const textObj = activeObject as IText;
          textObj.set("fontSize", size);
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      setFontFamily: (family: string) => {
        currentFontFamilyRef.current = family;
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject && (activeObject.type === "i-text" || activeObject.type === "textbox")) {
          const textObj = activeObject as IText;
          textObj.set("fontFamily", family);
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      setStrokeWidth: (width: number) => {
        currentStrokeWidthRef.current = width;
        if (!fabricRef.current) return;
        
        // Update brush
        if (fabricRef.current.freeDrawingBrush) {
          fabricRef.current.freeDrawingBrush.width = width;
        }
        
        // Update selected object
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject && activeObject.type !== "i-text" && activeObject.type !== "textbox") {
          activeObject.set("strokeWidth", width);
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      copySelected: () => {
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject) {
          activeObject.clone().then((cloned: any) => {
            clipboardRef.current = cloned;
          });
        }
      },

      paste: () => {
        if (!fabricRef.current || !clipboardRef.current) return;
        clipboardRef.current.clone().then((cloned: any) => {
          fabricRef.current?.discardActiveObject();
          cloned.set({
            left: (cloned.left || 0) + 20,
            top: (cloned.top || 0) + 20,
            evented: true,
          });
          if (cloned.type === "activeSelection") {
            cloned.canvas = fabricRef.current;
            cloned.forEachObject((obj: any) => fabricRef.current?.add(obj));
            cloned.setCoords();
          } else {
            fabricRef.current?.add(cloned);
          }
          clipboardRef.current.left += 20;
          clipboardRef.current.top += 20;
          fabricRef.current?.setActiveObject(cloned);
          fabricRef.current?.renderAll();
        });
      },

      bringToFront: () => {
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject) {
          fabricRef.current.bringObjectToFront(activeObject);
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      sendToBack: () => {
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject) {
          fabricRef.current.sendObjectToBack(activeObject);
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      flipHorizontal: () => {
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject) {
          activeObject.set("flipX", !activeObject.flipX);
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      rotate90: () => {
        if (!fabricRef.current) return;
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject) {
          const currentAngle = activeObject.angle || 0;
          activeObject.rotate(currentAngle + 90);
          fabricRef.current.renderAll();
          saveHistory();
        }
      },

      hasSelection: () => {
        return !!fabricRef.current?.getActiveObject();
      },

      getCanvasDataUrl: () => {
        if (!fabricRef.current) return null;
        return fabricRef.current.toDataURL({ format: "png", multiplier: 2 });
      },

      exportAnnotations: () => {
        if (!fabricRef.current) return "{}";
        return JSON.stringify(fabricRef.current.toJSON());
      },

      importAnnotations: (json: string) => {
        if (!fabricRef.current || !json || json === "{}") return;
        isUndoRedoRef.current = true;
        fabricRef.current.loadFromJSON(json).then(() => {
          fabricRef.current?.renderAll();
          isUndoRedoRef.current = false;
          historyRef.current = [json];
          historyIndexRef.current = 0;
          onHistoryChange(false, false);
        });
      },
    }));

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      const hasSelection = !!fabricRef.current?.getActiveObject();
      onContextMenu?.(e.clientX, e.clientY, hasSelection);
    };

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        style={{ zIndex: 10 }}
        onContextMenu={handleContextMenu}
      />
    );
  }
);

CanvasOverlay.displayName = "CanvasOverlay";
