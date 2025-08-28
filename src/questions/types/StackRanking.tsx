import React, { useState, useEffect } from 'react';
import type { StackRankingQuestion, StackRankingItem, QuestionComponentProps } from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const StackRanking: React.FC<QuestionComponentProps<string[]>> = ({
  question,
  value = [],
  onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  error,
  className = ''
}) => {
  const q = question as StackRankingQuestion;
  const [items, setItems] = useState<StackRankingItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  useEffect(() => {
    // Initialize items based on value or default order
    if (value && value.length > 0) {
      const orderedItems = value
        .map(id => q.items.find(item => item.id === id))
        .filter(Boolean) as StackRankingItem[];
      
      // Add any missing items at the end
      const missingItems = q.items.filter(item => !value.includes(item.id));
      setItems([...orderedItems, ...missingItems]);
    } else {
      setItems([...q.items]);
    }
  }, [value, q.items]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (disabled || readOnly) return;
    const item = items.find(i => i.id === itemId);
    if (item?.fixed) return;
    
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (disabled || readOnly || !draggedItem) return;
    
    const item = items.find(i => i.id === itemId);
    if (item?.fixed) return;
    
    if (itemId !== draggedItem) {
      setDragOverItem(itemId);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (disabled || readOnly || !draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const targetItem = items.find(i => i.id === targetId);
    if (targetItem?.fixed) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedIndex = items.findIndex(i => i.id === draggedItem);
    const targetIndex = items.findIndex(i => i.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newItems = [...items];
      const [removed] = newItems.splice(draggedIndex, 1);
      if (removed) {
        newItems.splice(targetIndex, 0, removed);
        
        setItems(newItems);
        const newValue = newItems.map(item => item.id);
        onChange(newValue);
      }
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (disabled || readOnly) return;
    
    const item = items.find(i => i.id === itemId);
    if (item?.fixed) return;

    const currentIndex = items.findIndex(i => i.id === itemId);
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          const prevItem = items[currentIndex - 1];
          if (prevItem && !prevItem.fixed) {
            newIndex = currentIndex - 1;
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          const nextItem = items[currentIndex + 1];
          if (nextItem && !nextItem.fixed) {
            newIndex = currentIndex + 1;
          }
        }
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      const newItems = [...items];
      const [removed] = newItems.splice(currentIndex, 1);
      if (removed) {
        newItems.splice(newIndex, 0, removed);
        
        setItems(newItems);
        const newValue = newItems.map(item => item.id);
        onChange(newValue);
      }

      // Focus management
      setTimeout(() => {
        const element = document.querySelector(`[data-item-id="${itemId}"]`) as HTMLElement;
        element?.focus();
      }, 0);
    }
  };

  return (
    <QuestionWrapper<string[]>
      className={className}
      disabled={disabled}
      error={error}
      question={question}
      readOnly={readOnly}
      value={items.map(i => i.id)}
      onChange={onChange}
      onValidate={onValidate}
    >
      <div className="space-y-2">
        {q.maxSelections && (
          <div className="text-sm text-gray-600 mb-2">
            Select up to {q.maxSelections} items
          </div>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              aria-label={`${item.label} - Position ${index + 1}`}
              className={`
                flex items-center gap-3 p-3 bg-white border rounded-lg
                transition-all duration-200
                ${item.fixed ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}
                ${!disabled && !readOnly && !item.fixed ? 'cursor-move hover:shadow-md' : ''}
                ${draggedItem === item.id ? 'opacity-50' : ''}
                ${dragOverItem === item.id ? 'border-blue-500 shadow-md' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
              data-item-id={item.id}
              draggable={!disabled && !readOnly && !item.fixed}
              role="button"
              tabIndex={disabled || readOnly || item.fixed ? -1 : 0}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
            >
              <div className="flex-shrink-0 text-gray-400">
                {item.fixed ? (
                  <span className="text-gray-500">📌</span>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                )}
              </div>

              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </div>

              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                )}
              </div>

              {q.allowTies && !item.fixed && (
                <select
                  aria-label={`Rank for ${item.label}`}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  disabled={disabled || readOnly}
                  value={index + 1}
                  onChange={(e) => {
                    const newIndex = parseInt(e.target.value) - 1;
                    if (newIndex !== index) {
                      const newItems = [...items];
                      const [removed] = newItems.splice(index, 1);
                      if (removed) {
                        newItems.splice(newIndex, 0, removed);
                        setItems(newItems);
                        onChange(newItems.map(i => i.id));
                      }
                    }
                  }}
                >
                  {items.map((_, i) => (
                    <option key={`rank-${i + 1}`} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 mt-2">
          {items.some(i => i.fixed) ? '📌 Fixed items cannot be moved' : 'Drag items or use arrow keys to reorder'}
        </div>
      </div>
    </QuestionWrapper>
  );
};

export default StackRanking;