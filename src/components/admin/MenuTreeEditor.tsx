'use client';

import { useState } from 'react';
import { MenuItemType } from '@/types';

interface MenuNodeProps {
  item: MenuItemType;
  onAdd: (parentId: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

function MenuNode({ item, onAdd, onRename, onDelete }: MenuNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [isExpanded, setIsExpanded] = useState(true);

  function handleRename() {
    if (editTitle.trim() && editTitle !== item.title) {
      onRename(item.id, editTitle.trim());
    }
    setIsEditing(false);
  }

  return (
    <li>
      <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50 group">
        {item.children && item.children.length > 0 ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 w-4 text-xs"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            autoFocus
            className="flex-1 px-1 py-0.5 border border-blue-400 rounded text-sm focus:outline-none"
          />
        ) : (
          <span
            className="flex-1 text-sm text-gray-700 cursor-pointer"
            onDoubleClick={() => setIsEditing(true)}
            title="더블클릭하여 이름 변경"
          >
            {item.title}
          </span>
        )}

        <div className="hidden group-hover:flex items-center gap-1">
          {item.depth < 4 && (
            <button
              onClick={() => onAdd(item.id)}
              className="text-xs text-blue-500 hover:text-blue-700 px-1"
              title="하위 메뉴 추가"
            >
              + 추가
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-gray-500 hover:text-gray-700 px-1"
          >
            수정
          </button>
          <button
            onClick={() => {
              if (confirm(`"${item.title}" 메뉴를 삭제하시겠습니까?`)) {
                onDelete(item.id);
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 px-1"
          >
            삭제
          </button>
        </div>
      </div>

      {isExpanded && item.children && item.children.length > 0 && (
        <ul className="ml-4 border-l border-gray-200 pl-2">
          {item.children.map((child) => (
            <MenuNode
              key={child.id}
              item={child}
              onAdd={onAdd}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface MenuTreeEditorProps {
  initialMenu: MenuItemType[];
}

export default function MenuTreeEditor({ initialMenu }: MenuTreeEditorProps) {
  const [menu, setMenu] = useState<MenuItemType[]>(initialMenu);
  const [newRootTitle, setNewRootTitle] = useState('');

  function addMenuItem(parentId: string) {
    const newTitle = prompt('새 메뉴 이름을 입력하세요:');
    if (!newTitle?.trim()) return;

    const newId = `menu-${Date.now()}`;
    const trimmedTitle = newTitle.trim();

    function addToTree(items: MenuItemType[]): MenuItemType[] {
      return items.map((item) => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [
              ...(item.children ?? []),
              { id: newId, title: trimmedTitle, depth: item.depth + 1, children: [] },
            ],
          };
        }
        if (item.children) return { ...item, children: addToTree(item.children) };
        return item;
      });
    }

    setMenu(addToTree(menu));
    console.log('메뉴 추가 (Sprint 3에서 DB 연동):', { parentId, title: trimmedTitle });
  }

  function renameMenuItem(id: string, newTitle: string) {
    function renameInTree(items: MenuItemType[]): MenuItemType[] {
      return items.map((item) => {
        if (item.id === id) return { ...item, title: newTitle };
        if (item.children) return { ...item, children: renameInTree(item.children) };
        return item;
      });
    }
    setMenu(renameInTree(menu));
    console.log('메뉴 이름 변경 (Sprint 3에서 DB 연동):', { id, newTitle });
  }

  function deleteMenuItem(id: string) {
    function deleteFromTree(items: MenuItemType[]): MenuItemType[] {
      return items
        .filter((item) => item.id !== id)
        .map((item) => ({
          ...item,
          children: item.children ? deleteFromTree(item.children) : undefined,
        }));
    }
    setMenu(deleteFromTree(menu));
    console.log('메뉴 삭제 (Sprint 3에서 DB 연동):', id);
  }

  function addRootMenu() {
    if (!newRootTitle.trim()) return;
    const newId = `menu-${Date.now()}`;
    setMenu([...menu, { id: newId, title: newRootTitle.trim(), depth: 1, children: [] }]);
    setNewRootTitle('');
    console.log('최상위 메뉴 추가 (Sprint 3에서 DB 연동):', newRootTitle);
  }

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <ul className="space-y-0.5">
          {menu.map((item) => (
            <MenuNode
              key={item.id}
              item={item}
              onAdd={addMenuItem}
              onRename={renameMenuItem}
              onDelete={deleteMenuItem}
            />
          ))}
        </ul>
        {menu.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            메뉴가 없습니다. 아래에서 추가하세요.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newRootTitle}
          onChange={(e) => setNewRootTitle(e.target.value)}
          placeholder="최상위 메뉴 이름"
          onKeyDown={(e) => e.key === 'Enter' && addRootMenu()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addRootMenu}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          최상위 메뉴 추가
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        항목에 마우스를 올리면 추가/수정/삭제 버튼이 표시됩니다. 더블클릭으로도 이름을 변경할 수
        있습니다.
      </p>
    </div>
  );
}
