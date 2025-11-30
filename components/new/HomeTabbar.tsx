"use client";

import { useEffect, useState } from "react";
import { Repeat } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

const HomeTabbar = ({ selectedTab, onTabSelect }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categories/")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  return (
    <div className="flex justify-center items-center flex-wrap gap-1.5 text-sm font-semibold w-full">
      <div className="flex items-center gap-1.5">
        {categories.map((item) => (
          <button
            onClick={() => onTabSelect(item.name)}
            key={item.id}
            className={`border border-darkColor px-4 py-1.5 md:px-6 md:py-2 rounded-full hover:bg-darkColor hover:text-white cursor-pointer hoverEffect ${
              selectedTab === item.name && "bg-darkColor text-white"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <button className="border border-darkColor px-2 py-2 rounded-full hover:bg-darkColor hover:text-white hoverEffect">
        <Repeat className="w-5 h-5" />
      </button>
    </div>
  );
};

export default HomeTabbar;
