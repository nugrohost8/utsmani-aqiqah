import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { PackageCategory } from "@/generated/prisma/client";
import { prisma } from "./db";

/** Tag cache per jenis konten; admin memanggil updateTag(tag) setelah mengubah data. */
export const TAGS = {
  packages: "packages",
  menu: "menu",
  testimonials: "testimonials",
  offices: "offices",
  faqs: "faqs",
  gallery: "gallery",
  posts: "posts",
  slides: "slides",
  settings: "settings",
} as const;

export async function getPackages(category?: PackageCategory) {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.packages);
  return prisma.package.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

export async function getMenuItems() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.menu);
  return prisma.menuItem.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export async function getTestimonials() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.testimonials);
  return prisma.testimonial.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export async function getOffices() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.offices);
  return prisma.office.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export async function getFaqs() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.faqs);
  return prisma.faq.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export async function getGallery() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.gallery);
  return prisma.galleryImage.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export async function getPublishedPosts(take?: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: { id: true, title: true, slug: true, excerpt: true, coverUrl: true, publishedAt: true },
  });
}

export async function getPostBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  return prisma.post.findFirst({ where: { slug, published: true } });
}

export async function getHeroSlides() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.slides);
  return prisma.heroSlide.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}
