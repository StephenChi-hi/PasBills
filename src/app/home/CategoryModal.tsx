import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineArrowPath, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
  recentCategories: Category[];
  allCategories: Category[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  recentCategories,
  allCategories,
}) => {
  if (!isOpen) return null;

  const CategoryItem = ({ cat }: { cat: Category }) => (
    <button
      onClick={() => {
        onSelect(cat);
        onClose();
      }}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-active:scale-90 ${cat.color}`}
      >
        <cat.icon className="w-7 h-7 text-gray-700" />
      </div>
      <Paragraph1 className="text-[11px] font-bold text-gray-800 text-center leading-tight">
        {cat.name}
      </Paragraph1>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <button onClick={onClose}>
          <X className="w-6 h-6 text-gray-400" />
        </button>
        <Paragraph1 className="text-lg font-bold">Select Category</Paragraph1>
        <HiOutlineArrowPath className="w-6 h-6 text-blue-500" />
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10">
        {/* Recent */}
        <section className="mb-8">
          <Paragraph1 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-tighter">
            Recent
          </Paragraph1>
          <div className="grid grid-cols-3 gap-y-6">
            {recentCategories.map((cat) => (
              <CategoryItem key={`recent-${cat.id}`} cat={cat} />
            ))}
          </div>
        </section>

        {/* All */}
        <section>
          <Paragraph1 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-tighter">
            All
          </Paragraph1>
          <div className="grid grid-cols-3 gap-y-8">
            {allCategories.map((cat) => (
              <CategoryItem key={`all-${cat.id}`} cat={cat} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoryModal;
