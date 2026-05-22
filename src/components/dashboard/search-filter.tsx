"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFilterProps {
    onSearch?: (value: string) => void;
    onSort?: (value: string) => void;
    sortOptions?: { label: string; value: string }[];
    placeholder?: string;
}

export function SearchFilter({ onSearch, onSort, sortOptions, placeholder = "Search..." }: SearchFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={placeholder}
                    className="pl-8"
                    onChange={(e) => onSearch && onSearch(e.target.value)}
                />
            </div>
            {onSort && sortOptions && (
                <div className="w-full sm:w-[200px]">
                    <Select onValueChange={onSort}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
