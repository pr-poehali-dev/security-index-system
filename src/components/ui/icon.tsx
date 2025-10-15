// src/components/ui/icon.tsx
// Описание: Обёртка для иконок Lucide с прямым импортом используемых иконок
import type { FC } from 'react';
import {
  AlertCircle, AlertTriangle, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp,
  Award, BarChart3, Bell, BookMarked, BookOpen, Building, Building2,
  Calendar, CalendarDays, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Circle, CircleAlert, ClipboardCheck, ClipboardList, Clock, Construction, Copy,
  Download, Edit, Eye, EyeOff, File, FileCheck, FileText, FileX, Filter, FolderOpen,
  GraduationCap, Grid, HelpCircle, Home, Info,
  KeyRound, LayoutDashboard, List, ListTodo, LogOut,
  Mail, Menu, MessageSquare, Microscope, Monitor, Moon, MoreHorizontal, MoreVertical,
  Newspaper, Pencil, Phone, PieChart, Play, PlayCircle, Plus, Printer,
  RefreshCw, Save, Search, Send, Settings, Shield, ShieldCheck, Sun,
  Target, Trash, Trash2, TrendingDown, TrendingUp,
  Upload, User, UserPlus, Users,
  Wallet, Wrench, X, XCircle,
  type LucideProps
} from 'lucide-react';

type IconName = 
  | 'AlertCircle' | 'AlertTriangle' | 'Archive' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp'
  | 'Award' | 'BarChart3' | 'Bell' | 'BookMarked' | 'BookOpen' | 'Building' | 'Building2'
  | 'Calendar' | 'CalendarDays' | 'Check' | 'CheckCircle' | 'CheckCircle2' | 'ChevronDown' | 'ChevronLeft' | 'ChevronRight' | 'ChevronUp'
  | 'Circle' | 'CircleAlert' | 'ClipboardCheck' | 'ClipboardList' | 'Clock' | 'Construction' | 'Copy'
  | 'Download' | 'Edit' | 'Eye' | 'EyeOff' | 'File' | 'FileCheck' | 'FileText' | 'FileX' | 'Filter' | 'FolderOpen'
  | 'GraduationCap' | 'Grid' | 'HelpCircle' | 'Home' | 'Info'
  | 'KeyRound' | 'LayoutDashboard' | 'List' | 'ListTodo' | 'LogOut'
  | 'Mail' | 'Menu' | 'MessageSquare' | 'Microscope' | 'Monitor' | 'Moon' | 'MoreHorizontal' | 'MoreVertical'
  | 'Newspaper' | 'Pencil' | 'Phone' | 'PieChart' | 'Play' | 'PlayCircle' | 'Plus' | 'Printer'
  | 'RefreshCw' | 'Save' | 'Search' | 'Send' | 'Settings' | 'Shield' | 'ShieldCheck' | 'Sun'
  | 'Target' | 'Trash' | 'Trash2' | 'TrendingDown' | 'TrendingUp'
  | 'Upload' | 'User' | 'UserPlus' | 'Users'
  | 'Wallet' | 'Wrench' | 'X' | 'XCircle';

interface IconProps extends LucideProps {
  name: IconName;
  fallback?: IconName;
}

const ICON_MAP: Record<string, FC<LucideProps>> = {
  AlertCircle, AlertTriangle, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp,
  Award, BarChart3, Bell, BookMarked, BookOpen, Building, Building2,
  Calendar, CalendarDays, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Circle, CircleAlert, ClipboardCheck, ClipboardList, Clock, Construction, Copy,
  Download, Edit, Eye, EyeOff, File, FileCheck, FileText, FileX, Filter, FolderOpen,
  GraduationCap, Grid, HelpCircle, Home, Info,
  KeyRound, LayoutDashboard, List, ListTodo, LogOut,
  Mail, Menu, MessageSquare, Microscope, Monitor, Moon, MoreHorizontal, MoreVertical,
  Newspaper, Pencil, Phone, PieChart, Play, PlayCircle, Plus, Printer,
  RefreshCw, Save, Search, Send, Settings, Shield, ShieldCheck, Sun,
  Target, Trash, Trash2, TrendingDown, TrendingUp,
  Upload, User, UserPlus, Users,
  Wallet, Wrench, X, XCircle,
};

const Icon: FC<IconProps> = ({ name, fallback = 'CircleAlert', ...props }) => {
  const IconComponent = ICON_MAP[name];

  if (!IconComponent) {
    const FallbackIcon = ICON_MAP[fallback];

    if (!FallbackIcon) {
      return <span className="text-xs text-gray-400">[icon]</span>;
    }

    return <FallbackIcon {...props} />;
  }

  return <IconComponent {...props} />;
};

export default Icon;
export type { IconName };