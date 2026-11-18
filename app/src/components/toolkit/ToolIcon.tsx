"use client";
import { BarChart3, Bot, FileText, Globe, Hammer, Lightbulb, LineChart, Mail, MapPin, Megaphone, MessageSquare, Newspaper, PenLine, Phone, Repeat2, Search, Smartphone, Star, Target, Users, Wrench } from "lucide-react";

const ICONS: Record<string, typeof Globe> = {
  "google-posts": MapPin, "local-seo-plan": Search, "town-page": Globe, "ai-search-fixes": Bot, "website-fixes": Wrench,
  "review-replies": MessageSquare, "review-system": Star, "homepage-rewrite": Smartphone, "landing-page": FileText, positioning: Target, "lead-magnet": Lightbulb,
  "missed-call": Phone, "google-ads": Megaphone, "meta-ads": Megaphone, "call-tracking": LineChart, "ads-check": BarChart3,
  "email-sequence": Mail, newsletter: Newspaper, "seo-article": PenLine, "social-posts": Users, repurpose: Repeat2, "long-guide": FileText,
  "brand-voice": MessageSquare, "competitor-teardown": Users, "results-review": BarChart3, "client-report": Hammer,
};
export function ToolIcon({ id, className }: { id: string; className?: string }) {
  const I = ICONS[id] ?? Wrench;
  return <I className={className} />;
}
