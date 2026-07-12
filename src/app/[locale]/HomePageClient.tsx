"use client";

import { Suspense, lazy } from "react";
import {
  BookOpen,
  Check,
  ClipboardCheck,
  Clock,
  Crown,
  Eye,
  Gamepad2,
  Home,
  Infinity as InfinityIcon,
  Map,
  MessageCircle,
  Sparkles,
  Star,
  Swords,
  Ticket,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

// 模块标题区（eyebrow + 标题 + 副标题 + 简介）—— 所有模块复用
function ModuleHeader({
  eyebrow,
  title,
  subtitle,
  intro,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  intro?: string;
}) {
  return (
    <div className="mb-10 text-center scroll-reveal md:mb-14">
      {eyebrow ? (
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1 text-xs font-medium text-[hsl(var(--nav-theme-light))] md:mb-4 md:text-sm">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mb-3 text-3xl font-bold leading-tight md:mb-4 md:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mb-2 max-w-3xl text-base text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      ) : null}
      {intro ? (
        <p className="mx-auto max-w-3xl text-sm text-muted-foreground/80 md:text-base">
          {intro}
        </p>
      ) : null}
    </div>
  );
}

// 卡片 / badge 配色工具（主题色为主，少量语义色用于状态）
function toneBadge(tone?: string): string {
  switch (tone) {
    case "accent":
      return "border-[hsl(var(--nav-theme)/0.4)] bg-[hsl(var(--nav-theme)/0.15)] text-[hsl(var(--nav-theme-light))]";
    case "success":
      return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
    case "muted":
      return "border-border bg-white/5 text-muted-foreground";
    default:
      return "border-border bg-white/5 text-foreground";
  }
}

// 优先级 badge（traits rerollPriority / updates status）
function priorityBadge(value: string): string {
  const v = value.toLowerCase();
  if (["high", "confirmed", "active"].includes(v)) {
    return "border-[hsl(var(--nav-theme)/0.4)] bg-[hsl(var(--nav-theme)/0.15)] text-[hsl(var(--nav-theme-light))]";
  }
  if (["keep"].includes(v)) {
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  }
  if (["revealed", "showcased"].includes(v)) {
    return "border-[hsl(var(--nav-theme)/0.35)] bg-[hsl(var(--nav-theme)/0.1)] text-[hsl(var(--nav-theme-light))]";
  }
  return "border-border bg-white/5 text-muted-foreground";
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.animeorigins.wiki";

  // Tools Grid 卡片 → section 锚点（顺序与 en.json tools.cards 一一对应）
  const toolsSectionIds = [
    "codes",
    "beginner-guide",
    "unit-tier-list",
    "units-and-summoning",
    "traits-and-rerolls",
    "evolution-guide",
    "story-infinite-and-raids",
    "updates",
  ];

  // 模块内部卡片组图标（每组内各异）
  const codeIcons: LucideIcon[] = [Ticket, Clock, MessageCircle, ClipboardCheck];
  const tierIcons: LucideIcon[] = [Crown, Star, Eye, ClipboardCheck];
  const modeIcons: LucideIcon[] = [
    Map,
    InfinityIcon,
    Swords,
    Users,
    Home,
    Gamepad2,
  ];

  // 结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Anime Origins Wiki",
        description:
          "Complete Anime Origins Wiki covering codes, units, tier lists, summons, traits, evolutions, Story Mode, Infinite Mode, raids, and beginner team-building tips for the Roblox anime tower defense game.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Anime Origins - Roblox Anime Tower Defense",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Anime Origins Wiki",
        alternateName: "Anime Origins",
        url: siteUrl,
        description:
          "Complete Anime Origins Wiki resource hub for codes, units, tier lists, summons, traits, evolutions, raids, and beginner guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Anime Origins Wiki - Roblox Anime Tower Defense",
        },
        sameAs: [
          "https://disboard.org/server/1419125575335022734",
          "https://www.youtube.com/watch?v=wQVrE_Mdhn0",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Anime Origins",
        gamePlatform: ["Roblox", "Mobile", "Tablet", "PC", "Console"],
        applicationCategory: "Game",
        genre: ["Anime", "Tower Defense", "Strategy", "Gacha"],
        numberOfPlayers: {
          minValue: 1,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/PreOrder",
          url: "https://disboard.org/server/1419125575335022734",
        },
      },
      {
        "@type": "VideoObject",
        name: "Anime Origins Gameplay Preview",
        description:
          "Anime Origins gameplay preview featuring summons, upgrades, evolution, and tower defense modes.",
        uploadDate: "2026-03-12",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/wQVrE_Mdhn0",
        url: "https://www.youtube.com/watch?v=wQVrE_Mdhn0",
      },
    ],
  };

  const mobileBannerAd = getPreferredMobileBannerSelection();

  // 模块数据快捷引用
  const m = t.modules;

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner
          type="banner-320x50"
          adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50}
        />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-14 pt-24 md:pb-20 md:pt-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center scroll-reveal">
            {/* Badge */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1.5 md:mb-6 md:px-4 md:py-2"
            >
              <Sparkles className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs font-medium md:text-sm">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold leading-[1.05] sm:text-5xl md:mb-6 md:text-7xl">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("codes")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--nav-theme))] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[hsl(var(--nav-theme)/0.9)] md:px-8 md:py-4 md:text-lg"
              >
                <Ticket className="h-5 w-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://disboard.org/server/1419125575335022734"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3.5 text-base font-semibold transition-colors hover:bg-white/10 md:px-8 md:py-4 md:text-lg"
              >
                {t.hero.playOnRobloxCTA}
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section — 容器上限 max-w-5xl，避免挤压广告展示空间 */}
      <section className="px-4 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="wQVrE_Mdhn0"
              title="Anime Origins Gameplay Preview"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（模块导航区，紧跟视频区） */}
      <section className="bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 text-center scroll-reveal md:mb-12">
            <h2 className="mb-3 text-3xl font-bold md:mb-4 md:text-5xl">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = toolsSectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="group cursor-pointer rounded-xl border border-border bg-card p-4 text-left transition-all duration-300 hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)] scroll-reveal md:p-6"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)] transition-colors group-hover:bg-[hsl(var(--nav-theme)/0.2)] md:mb-4 md:h-12 md:w-12"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))] md:h-6 md:w-6"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold md:text-base">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section（Latest Updates 模块，位置保留） */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Codes — code-cards */}
      <section id="codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={m.animeOriginsCodes.eyebrow}
            title={m.animeOriginsCodes.title}
            subtitle={m.animeOriginsCodes.subtitle}
            intro={m.animeOriginsCodes.intro}
          />

          <div className="mb-8 grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2">
            {m.animeOriginsCodes.items.map((item: any, index: number) => {
              const Icon = codeIcons[index % codeIcons.length];
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.12)]">
                      <Icon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${toneBadge(item.statusTone)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mb-1.5 font-semibold">{item.reward}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.requirements}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.05)] p-5 scroll-reveal md:p-6">
            <div className="mb-3 flex items-center gap-2 md:mb-4">
              <ClipboardCheck className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-base font-bold md:text-lg">
                Anime Origins Redemption Tips
              </h3>
            </div>
            <ul className="space-y-2">
              {m.animeOriginsCodes.tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Beginner Guide — step-by-step */}
      <section
        id="beginner-guide"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={m.animeOriginsBeginnerGuide.eyebrow}
            title={m.animeOriginsBeginnerGuide.title}
            subtitle={m.animeOriginsBeginnerGuide.subtitle}
            intro={m.animeOriginsBeginnerGuide.intro}
          />

          <div className="mb-8 space-y-3 scroll-reveal md:space-y-4">
            {m.animeOriginsBeginnerGuide.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:gap-4 md:p-6"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)] md:h-12 md:w-12">
                  <span className="text-base font-bold text-[hsl(var(--nav-theme-light))] md:text-xl">
                    {step.step}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg font-bold md:mb-2 md:text-xl">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {step.description}
                  </p>
                  <div className="mt-2 flex items-start gap-2 text-sm">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                    <span className="text-muted-foreground">{step.tip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.05)] p-5 scroll-reveal md:p-6">
            <div className="mb-3 flex items-center gap-2 md:mb-4">
              <BookOpen className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-base font-bold md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {m.animeOriginsBeginnerGuide.quickTips.map(
                (tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                    <span className="text-sm text-muted-foreground">{tip}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Module 3: Unit Tier List — tier-grid */}
      <section id="unit-tier-list" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={m.animeOriginsUnitTierList.eyebrow}
            title={m.animeOriginsUnitTierList.title}
            subtitle={m.animeOriginsUnitTierList.subtitle}
            intro={m.animeOriginsUnitTierList.intro}
          />

          <div className="space-y-5 scroll-reveal">
            {m.animeOriginsUnitTierList.tiers.map((tier: any, index: number) => {
              const Icon = tierIcons[index % tierIcons.length];
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3 border-b border-border bg-[hsl(var(--nav-theme)/0.08)] p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.2)] text-lg font-bold text-[hsl(var(--nav-theme-light))]">
                      {tier.tier}
                    </span>
                    <Icon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                    <h3 className="font-bold">{tier.label}</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {tier.units.map((unit: any, ui: number) => (
                      <div
                        key={ui}
                        className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:gap-5"
                      >
                        <div className="flex-shrink-0 md:w-44">
                          <p className="font-bold">{unit.name}</p>
                          <span className="mt-1 inline-block rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2 py-0.5 text-xs text-[hsl(var(--nav-theme-light))]">
                            {unit.rarity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="mb-2 text-sm text-muted-foreground">
                            {unit.role}
                          </p>
                          <ul className="space-y-1 text-sm">
                            {unit.strengths.map((s: string, si: number) => (
                              <li key={si} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="md:text-right">
                          <p className="text-xs text-muted-foreground">
                            Summon Rate
                          </p>
                          <p className="font-semibold text-[hsl(var(--nav-theme-light))]">
                            {unit.summonRate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module 4: Units and Summoning — table */}
      <section
        id="units-and-summoning"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={m.animeOriginsUnitsAndSummoning.eyebrow}
            title={m.animeOriginsUnitsAndSummoning.title}
            subtitle={m.animeOriginsUnitsAndSummoning.subtitle}
            intro={m.animeOriginsUnitsAndSummoning.intro}
          />

          {/* 桌面表格 */}
          <div className="mb-6 hidden overflow-x-auto rounded-xl border border-border scroll-reveal md:block">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-4 font-semibold">Unit</th>
                  <th className="p-4 font-semibold">Rarity</th>
                  <th className="p-4 font-semibold">Summon Rate</th>
                  <th className="p-4 font-semibold">Availability</th>
                  <th className="p-4 font-semibold">Attack Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {m.animeOriginsUnitsAndSummoning.items.map(
                  (unit: any, index: number) => (
                    <tr key={index} className="align-top">
                      <td className="p-4">
                        <p className="font-semibold">{unit.name}</p>
                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                          {unit.details}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2 py-0.5 text-xs text-[hsl(var(--nav-theme-light))]">
                          {unit.rarity}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {unit.summonRate}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {unit.availability}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {unit.attackProfile}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {/* 移动端卡片 */}
          <div className="space-y-3 scroll-reveal md:hidden">
            {m.animeOriginsUnitsAndSummoning.items.map(
              (unit: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="font-bold">{unit.name}</p>
                    <span className="flex-shrink-0 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2 py-0.5 text-xs text-[hsl(var(--nav-theme-light))]">
                      {unit.rarity}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {unit.details}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Summon Rate</p>
                      <p className="font-medium">{unit.summonRate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Availability</p>
                      <p className="font-medium">{unit.availability}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {unit.attackProfile}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 5: Traits and Rerolls — comparison-table */}
      <section
        id="traits-and-rerolls"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={m.animeOriginsTraitsAndRerolls.eyebrow}
            title={m.animeOriginsTraitsAndRerolls.title}
            subtitle={m.animeOriginsTraitsAndRerolls.subtitle}
            intro={m.animeOriginsTraitsAndRerolls.intro}
          />

          {/* 桌面表格 */}
          <div className="mb-6 hidden overflow-x-auto rounded-xl border border-border scroll-reveal md:block">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-4 font-semibold">Trait Focus</th>
                  <th className="p-4 font-semibold">Combat Effect</th>
                  <th className="p-4 font-semibold">Best For</th>
                  <th className="p-4 font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {m.animeOriginsTraitsAndRerolls.items.map(
                  (item: any, index: number) => (
                    <tr key={index} className="align-top">
                      <td className="p-4">
                        <p className="font-semibold text-[hsl(var(--nav-theme-light))]">
                          {item.traitFocus}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.usageTip}
                        </p>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {item.combatEffect}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {item.bestFor}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityBadge(item.rerollPriority)}`}
                        >
                          {item.rerollPriority}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {/* 移动端卡片 */}
          <div className="space-y-3 scroll-reveal md:hidden">
            {m.animeOriginsTraitsAndRerolls.items.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="font-bold text-[hsl(var(--nav-theme-light))]">
                      {item.traitFocus}
                    </p>
                    <span
                      className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${priorityBadge(item.rerollPriority)}`}
                    >
                      {item.rerollPriority}
                    </span>
                  </div>
                  <p className="mb-2 text-sm">{item.combatEffect}</p>
                  <p className="mb-1 text-xs text-muted-foreground">
                    <span className="font-medium">Best for:</span> {item.bestFor}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {item.usageTip}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 6: Evolution Guide — upgrade-path */}
      <section
        id="evolution-guide"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={m.animeOriginsEvolutionGuide.eyebrow}
            title={m.animeOriginsEvolutionGuide.title}
            subtitle={m.animeOriginsEvolutionGuide.subtitle}
            intro={m.animeOriginsEvolutionGuide.intro}
          />

          <div className="relative space-y-4 scroll-reveal">
            {m.animeOriginsEvolutionGuide.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:gap-4 md:p-6"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)] md:h-12 md:w-12">
                  <span className="text-base font-bold text-[hsl(var(--nav-theme-light))] md:text-xl">
                    {step.step}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-bold md:text-xl">
                    {step.name}
                  </h3>
                  <p className="mb-1.5 text-sm font-medium">
                    {step.action}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Story, Infinite and Raids — mode-cards */}
      <section
        id="story-infinite-and-raids"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={m.animeOriginsStoryInfiniteAndRaids.eyebrow}
            title={m.animeOriginsStoryInfiniteAndRaids.title}
            subtitle={m.animeOriginsStoryInfiniteAndRaids.subtitle}
            intro={m.animeOriginsStoryInfiniteAndRaids.intro}
          />

          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2 lg:grid-cols-3">
            {m.animeOriginsStoryInfiniteAndRaids.modes.map(
              (mode: any, index: number) => {
                const Icon = modeIcons[index % modeIcons.length];
                return (
                  <div
                    key={index}
                    className="flex flex-col rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.12)]">
                        <Icon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                      </span>
                      <h3 className="font-bold">{mode.mode}</h3>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {mode.objective}
                    </p>
                    <dl className="mt-auto space-y-2.5 text-xs">
                      <div>
                        <dt className="font-semibold text-[hsl(var(--nav-theme-light))]">
                          Recommended Team
                        </dt>
                        <dd className="text-muted-foreground">
                          {mode.recommendedTeam}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[hsl(var(--nav-theme-light))]">
                          Placement Tip
                        </dt>
                        <dd className="text-muted-foreground">
                          {mode.placementTip}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[hsl(var(--nav-theme-light))]">
                          Reward Focus
                        </dt>
                        <dd className="text-muted-foreground">
                          {mode.rewardFocus}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[hsl(var(--nav-theme-light))]">
                          Best For
                        </dt>
                        <dd className="text-muted-foreground">
                          {mode.bestFor}
                        </dd>
                      </div>
                    </dl>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Module 8: Updates — timeline */}
      <section
        id="updates"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={m.animeOriginsUpdates.eyebrow}
            title={m.animeOriginsUpdates.title}
            subtitle={m.animeOriginsUpdates.subtitle}
            intro={m.animeOriginsUpdates.intro}
          />

          <div className="relative space-y-6 border-l-2 border-[hsl(var(--nav-theme)/0.3)] pl-6 scroll-reveal">
            {m.animeOriginsUpdates.entries.map((entry: any, index: number) => (
              <div key={index} className="relative">
                <div className="absolute -left-[1.65rem] h-4 w-4 rounded-full border-2 border-background bg-[hsl(var(--nav-theme))]" />
                <div className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2 py-0.5 text-xs text-[hsl(var(--nav-theme-light))]">
                      {entry.category}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityBadge(entry.status)}`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <h3 className="mb-2 font-bold">{entry.headline}</h3>
                  <ul className="space-y-1 text-sm">
                    {entry.changes.map((change: string, ci: number) => (
                      <li key={ci} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                        <span className="text-muted-foreground">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="border-t border-border bg-white/[0.02]">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://disboard.org/server/1419125575335022734"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=wQVrE_Mdhn0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
