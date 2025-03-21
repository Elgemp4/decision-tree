import React, { useState, useEffect, useRef } from "react";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = "",
  multiline = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? "textarea" : "input";
    return (
      <InputComponent
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-1 border rounded shadow-sm ${className}`}
        rows={multiline ? 3 : 1}
      />
    );
  }

  return (
    <div onClick={handleClick} className={`cursor-pointer ${className}`}>
      {value}
    </div>
  );
};

export default EditableText;
