import { twMerge } from "tailwind-merge";
import PriceFormatter from "./PriceFormatter";

interface Props {
  amount: number; // قيمة السعر المحسوبة
  quantity: number; // الكمية
  className?: string;
}

const PriceView = ({ amount, className }: Props) => {
  // لا حاجة لحساب الخصم هنا، سنعرض السعر كما هو
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {/* عرض السعر كما هو بدون خصم */}
        <PriceFormatter amount={amount} className={className} />
      </div>
    </div>
  );
};

export default PriceView;
