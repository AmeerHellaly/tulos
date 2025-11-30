"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

const HeaderMenu = () => {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categories/")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  return (
    <div className="hidden md:inline-flex w-1/3 items-center gap-5 text-sm capitalize font-semibold text-lightColor">
      {/* Home Link */}
      <Link
        href={"/"}
        className={`hover:text-darkColor hoverEffect relative group ${pathname === "/" && "text-darkColor"}`}
      >
        Home
        <span
          className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-darkColor transition-all duration-300 group-hover:w-1/2 group-hover:left-0 ${
            pathname === "/" && "w-1/2"
          }`}
        />
        <span
          className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-darkColor transition-all duration-300 group-hover:w-1/2 group-hover:right-0 ${
            pathname === "/" && "w-1/2"
          }`}
        />
      </Link>

      {/* Dynamic Categories */}
{isClient &&
  categories.map((cat) => (
    <Link
      key={cat.id}
      href={`/category/${cat.slug}`}
      className={`hover:text-darkColor hoverEffect relative group ${
        pathname === `/category/${cat.slug}` ? "text-darkColor" : ""
      }`}
    >
      {cat.name}
      <span
        className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-darkColor transition-all duration-300 group-hover:w-1/2 group-hover:left-0 ${
          pathname === `/category/${cat.slug}` ? "w-1/2" : ""
        }`}
      />
      <span
        className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-darkColor transition-all duration-300 group-hover:w-1/2 group-hover:right-0 ${
          pathname === `/category/${cat.slug}` ? "w-1/2" : ""
        }`}
      />
    </Link>
))}



    </div>
  );
};

export default HeaderMenu;
