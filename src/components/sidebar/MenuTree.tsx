import { MenuItemType } from '@/types';
import MenuItem from './MenuItem';

interface MenuTreeProps {
  items: MenuItemType[];
}

export default function MenuTree({ items }: MenuTreeProps) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </ul>
  );
}
