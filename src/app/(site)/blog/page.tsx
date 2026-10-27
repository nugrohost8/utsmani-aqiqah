import type { Metadata } from "next";
import { PageHead } from "@/components/site/Hero";
import { PostGrid } from "@/components/site/Sections";
import { getPublishedPosts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artikel seputar aqiqah, tuntunan syariat, dan tips memilih paket aqiqah.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <PageHead tag="Blog" title="Artikel Seputar Aqiqah" description="Panduan, tuntunan, dan tips seputar aqiqah untuk Ayah dan Bunda." />
      <section className="section bg-fade" style={{ paddingTop: 60 }}>
        <div className="container">
          <PostGrid posts={posts} />
        </div>
      </section>
    </>
  );
}
