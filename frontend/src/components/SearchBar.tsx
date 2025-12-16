import { ChangeEvent } from "react";

interface SearchBarProps {
  keyword: string;
  onChange: (value: string) => void;
}

export function SearchBar({ keyword, onChange }: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={keyword}
        onChange={handleChange}
        placeholder="Search by school name..."
      />
    </div>
  );
}






