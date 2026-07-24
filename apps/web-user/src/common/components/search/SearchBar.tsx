"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";
import { primeSoftKeyboard } from "@/apps/web-user/common/utils/soft-keyboard.util";
import { Icon } from "../icons";

interface SearchBarProps {
  initialValue?: string;
  onSearch?: (searchTerm: string) => void;
  onChange?: (searchTerm: string) => void;
  placeholder?: string;
  /**
   * true면 입력 없이 버튼처럼 동작해, 누르면 바로 검색 페이지로 이동한다.
   * 홈처럼 실제 입력은 검색 페이지에서 받는 화면에 사용한다.
   */
  asButton?: boolean;
}

/** 입력창과 버튼 모드가 같은 모양을 유지하도록 공유하는 컨테이너 스타일 */
const CONTAINER_CLASS =
  "flex items-center gap-2 w-full h-10 px-4 border border-gray-100 rounded-full text-base bg-white text-gray-900 outline-none shadow-[0px_3px_10px_0px_rgba(0,0,0,0.04)]";

export function SearchBar({
  initialValue = "",
  onSearch,
  onChange,
  placeholder = "어떤 케이크를 찾으시나요?",
  asButton = false,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const router = useRouter();

  // initialValue가 변경되면 searchTerm 업데이트
  useEffect(() => {
    if (initialValue !== searchTerm) {
      setSearchTerm(initialValue);
    }
  }, [initialValue]);

  const handleChange = (value: string) => {
    setSearchTerm(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      if (onSearch) {
        onSearch(trimmedSearchTerm);
      } else {
        router.push(`${PATHS.SEARCH}?q=${encodeURIComponent(trimmedSearchTerm)}`);
      }
    }
  };

  // 버튼 모드: 입력 대신 검색 페이지로 이동만 한다
  if (asButton) {
    // 검색 페이지에 도착하자마자 키보드가 올라오도록, 탭 제스처 안에서 미리 띄워둔다
    const handleButtonClick = () => {
      primeSoftKeyboard();
      router.push(PATHS.SEARCH);
    };

    return (
      <button
        type="button"
        onClick={handleButtonClick}
        className={`${CONTAINER_CLASS} max-w-full text-left`}
      >
        <Icon name="search" width={20} height={20} className="text-gray-800 shrink-0" />
        <span className="flex-1 text-sm text-gray-400">{placeholder}</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full">
      <div className={CONTAINER_CLASS}>
        <Icon name="search" width={20} height={20} className="text-gray-800 shrink-0" />
        <input
          type="search"
          enterKeyHint="search"
          value={searchTerm}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
      </div>
    </form>
  );
}
