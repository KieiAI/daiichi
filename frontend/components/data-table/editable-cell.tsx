'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditableCellProps {
  value: string | number;
  onSave: (value: string | number) => void;
  type?: 'text' | 'number' | 'textarea' | 'select';
  options?: string[];
  className?: string;
}

export function EditableCell({ 
  value, 
  onSave, 
  type = 'text', 
  options = [],
  className = ""
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      if (type === 'textarea') {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      } else {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
  }, [isEditing, type]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    if (type === 'select') {
      return (
        <Select
          value={String(editValue)}
          onValueChange={(newValue) => {
            setEditValue(newValue);
            onSave(newValue);
            setIsEditing(false);
          }}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              handleCancel();
            }
          }}
        >
          <SelectTrigger className="h-8 border-blue-500 focus:ring-2 focus:ring-blue-500 text-center">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'textarea') {
      return (
        <Textarea
          ref={textareaRef}
          value={String(editValue)}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="min-h-[60px] border-blue-500 focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
      );
    }

    return (
      <Input
        ref={inputRef}
        type={type}
        value={String(editValue)}
        onChange={(e) => setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-full w-full text-xs border-0 bg-transparent focus:border-0 focus:ring-0 focus:outline-none p-1 m-0"
      />
    );
  }

  return (
    <div
      className={`cursor-pointer hover:bg-blue-50 p-1 transition-colors h-full w-full flex items-center justify-center text-sm ${className}`}
      onDoubleClick={handleDoubleClick}
      title="ダブルクリックで編集"
    >
      {type === 'textarea' ? (
        <div className={`whitespace-pre-wrap break-words w-full text-xs leading-tight ${className.includes('text-center') ? 'text-center' : ''}`}>
          {String(value) || '-'}
        </div>
      ) : (
        <span className={`truncate w-full text-xs ${className.includes('text-center') ? 'text-center' : ''}`}>
          {String(value) || '-'}
        </span>
      )}
    </div>
  );
}