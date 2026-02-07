"use client";

import Image from "next/image";
import { ReactNode, ElementType } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon | ElementType | ReactNode;
  action?: ReactNode;
  imageType?: "default" | "messages" | "payments" | "calendar" | "documents" | "academic" | "attendance" | "directory";
}

const imageMap: Record<string, string> = {
  default: "https://cdn.abacus.ai/images/27f41107-75dd-4bd9-94d9-0804c12e0064.jpg",
  messages: "https://cdn.abacus.ai/images/6aaea341-7da5-4b5d-bb74-20fc6475f8fa.jpg",
  payments: "https://cdn.abacus.ai/images/97765e4f-e8b1-4e40-9239-8274e375e137.jpg",
  calendar: "https://cdn.abacus.ai/images/5abe7ef7-1af9-406c-b536-28a441433309.jpg",
  documents: "https://cdn.abacus.ai/images/4fd07481-84b1-4d5d-9799-8cd6d0707dbb.jpg",
  academic: "https://cdn.abacus.ai/images/884266ec-1e7f-418b-95bb-20017de43d36.jpg",
  attendance: "https://cdn.abacus.ai/images/e39a2eeb-982c-41b9-a317-0d800c978e79.jpg",
  directory: "https://cdn.abacus.ai/images/ac747400-813d-4ed9-a4e5-9967b3ee2c88.jpg",
};

export function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  action,
  imageType = "default" 
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!Icon) return null;
    
    // If it's a Lucide icon or component function
    if (typeof Icon === 'function') {
      const IconComponent = Icon as ElementType;
      return <IconComponent className="w-8 h-8 text-gray-400" />;
    }
    
    // If it's already a ReactNode
    return Icon;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative w-48 h-48 mb-6 rounded-2xl overflow-hidden opacity-80">
        <Image
          src={imageMap[imageType]}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 -mt-12 relative z-10 border-4 border-white shadow-lg">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

// Section header component with decorative image
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  imageType?: keyof typeof imageMap;
  children?: ReactNode;
}

export function SectionHeader({ title, subtitle, imageType, children }: SectionHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B4079] to-[#2d5a9e] p-6 mb-6">
      {imageType && (
        <div className="absolute inset-0 opacity-20">
          <Image
            src={imageMap[imageType]}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-white/70 mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}