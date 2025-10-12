// src/components/ui/icon.tsx
// Описание: Обёртка для иконок Lucide с прямым импортом используемых иконок
import type { FC } from 'react';
import {
  AlertCircle, AlertTriangle, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp,
  Award, BarChart3, Bell, BookOpen, Building, Building2,
  Calendar, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Circle, CircleAlert, ClipboardCheck, ClipboardList, Clock, Copy,
  Download, Edit, Eye, EyeOff, File, FileText, Filter, FolderOpen,
  GraduationCap, Grid, HelpCircle, Home, Info,
  LayoutDashboard, List, ListTodo, LogOut,
  Mail, MessageSquare, Microscope, Moon, MoreHorizontal, MoreVertical,
  Pencil, Phone, PieChart, Play, PlayCircle, Plus, Printer,
  RefreshCw, Save, Search, Send, Settings, Shield, Sun,
  Trash, Trash2, TrendingDown, TrendingUp,
  Upload, User, Users,
  Wallet, Wrench, X, XCircle,
  type LucideProps
} from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
  fallback?: string;
}

const ICON_MAP: Record<string, FC<LucideProps>> = {
  AlertCircle, AlertTriangle, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp,
  Award, BarChart3, Bell, BookOpen, Building, Building2,
  Calendar, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Circle, CircleAlert, ClipboardCheck, ClipboardList, Clock, Copy,
  Download, Edit, Eye, EyeOff, File, FileText, Filter, FolderOpen,
  GraduationCap, Grid, HelpCircle, Home, Info,
  LayoutDashboard, List, ListTodo, LogOut,
  Mail, MessageSquare, Microscope, Moon, MoreHorizontal, MoreVertical,
  Pencil, Phone, PieChart, Play, PlayCircle, Plus, Printer,
  RefreshCw, Save, Search, Send, Settings, Shield, Sun,
  Trash, Trash2, TrendingDown, TrendingUp,
  Upload, User, Users,
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