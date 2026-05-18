import React from 'react';
import { DndContext, useDraggable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

interface DraggablePositionerProps {
  position: { x: number; y: number };
  onChange: (pos: { x: number; y: number }) => void;
}

export function DraggablePositioner({ position, onChange }: DraggablePositionerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 2 } })
  );

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: any) => {
    const { delta } = event;
    if (delta.x || delta.y) {
      const containerW = containerRef.current?.offsetWidth || 300;
      const containerH = containerRef.current?.offsetHeight || 150;
      
      let newX = position.x + (delta.x / containerW) * 100;
      let newY = position.y + (delta.y / containerH) * 100;
      
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));
      
      onChange({ x: Math.round(newX), y: Math.round(newY) });
    }
  };

  return (
    <div className="space-y-2 col-span-1 md:col-span-2">
      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Drag Text Position</label>
      <div 
        ref={containerRef}
        className="relative w-full h-[150px] bg-gray-100 border border-gray-300 rounded-lg overflow-hidden"
      >
        <div className="absolute inset-x-0 inset-y-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
            {Array.from({length: 9}).map((_, i) => (
                <div key={i} className="border border-black/10" />
            ))}
        </div>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <DraggableItem position={position} />
        </DndContext>
      </div>
      <div className="flex justify-center gap-4 text-[10px] font-mono text-gray-400">
        <span>X: {position.x}%</span>
        <span>Y: {position.y}%</span>
      </div>
    </div>
  );
}

function DraggableItem({ position }: { position: { x: number; y: number } }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-text',
  });

  const style = {
    position: 'absolute' as const,
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: transform ? `translate3d(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px), 0)` : 'translate(-50%, -50%)',
    touchAction: 'none'
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 bg-black text-white rounded-lg shadow-xl text-[10px] font-bold whitespace-nowrap z-10 cursor-grab active:cursor-grabbing border border-white/20"
    >
      TITLE / SUBTITLE
    </button>
  );
}
