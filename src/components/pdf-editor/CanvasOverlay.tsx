import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, Rect, Circle, Line, IText, FabricImage, PencilBrush, FabricObject } from "fabric";

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
}

interface CanvasOverlayProps {
  width: number;
  height: number;
  activeTool: string;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
}

export const CanvasOverlay = forwardRef<CanvasOverlayRef, CanvasOverlayProps>(
  ({ width, height, activeTool, onHistoryChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<FabricCanvas | null>(null);
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const isUndoRedoRef = useRef<boolean>(false);

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
      canvas.freeDrawingBrush.width = 2;

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
      
      switch (activeTool) {
        case "draw":
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush!.color = "#000000";
          canvas.freeDrawingBrush!.width = 2;
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
          fontSize: 16,
          fill: "#000000",
          fontFamily: "Arial",
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
          stroke: "#6366f1",
          strokeWidth: 2,
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
          stroke: "#6366f1",
          strokeWidth: 2,
        });
        fabricRef.current.add(circle);
        fabricRef.current.setActiveObject(circle);
      },

      addLine: () => {
        if (!fabricRef.current) return;
        const line = new Line([50, 50, 200, 50], {
          stroke: "#6366f1",
          strokeWidth: 2,
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
          fabricRef.current.freeDrawingBrush!.color = "#000000";
          fabricRef.current.freeDrawingBrush!.width = 2;
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
    }));

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        style={{ zIndex: 10 }}
      />
    );
  }
);

CanvasOverlay.displayName = "CanvasOverlay";
