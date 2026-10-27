/* eslint-disable @next/next/no-img-element -- cover disajikan dari /uploads */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/site/Hero";
import { Markdown } from "@/components/Markdown";
import { formatDate } from "@/lib/format";
import { getPostBySlug, getPublishedPosts } from "@/lib/queries";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt ?? undefined, openGraph: { images: post.coverUrl ? [post.coverUrl] : [] } };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();

  return (
    <>
      <PageHead tag={formatDate(post.publishedAt)} title={post.title} description={post.excerpt ?? undefined} />
      <section className="section bg-fade" style={{ paddingTop: 60 }}>
        <article className="container article">
          {post.coverUrl && (
            <div className="cover">
              <img src={post.coverUrl} alt="" style={{ width: "100%" }} />
            </div>
          )}
          <div className="prose">
            <Markdown source={post.content} />
          </div>
          <p style={{ marginTop: 40 }}>
            <Link className="btn btn-line" href="/blog">
              ← Kembali ke Blog
            </Link>
          </p>
        </article>
      </section>
    </>
  );
}
