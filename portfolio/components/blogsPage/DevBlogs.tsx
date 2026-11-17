"use client";

import Link from "next/link";
import Title from "../Title";
import { useSite } from "../SiteProvider";
import { EditableItem, EditableProfileArea, SectionTools } from "../edit/Editable";
import BlogPostCard from "./BlogPostCard";

export default function DevBlogs() {
  const { profile, blogPosts } = useSite();
  const { blog } = profile;
  const hasPosts = blogPosts.length > 0;

  return (
    <section className="h-full overflow-y-scroll myScroll">
      <Title
        name="blogs"
        actions={
          <SectionTools
            slug="blog-posts"
            title="blog post"
            items={blogPosts.map((p) => ({ id: p.id, label: p.title }))}
          />
        }
      />

      <EditableProfileArea tab="Blog section" label="Edit blog intro">
        <div className={hasPosts ? "px-12 pt-10 pb-2" : "px-12 py-16 text-center"}>
          {blog.intro && (
            <p className={`text-2xl text-gray-400 leading-relaxed ${hasPosts ? "" : "max-w-3xl mx-auto"}`}>
              {blog.intro}
            </p>
          )}
          {blog.buttonUrl && !hasPosts && (
            <Link
              href={blog.buttonUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-8 text-xl uppercase font-semibold text-gray-300 border-2 border-gray-300 rounded-full px-8 py-3 hover:text-main-orange hover:border-main-orange transition-all duration-200"
            >
              {blog.buttonLabel}
            </Link>
          )}
        </div>
      </EditableProfileArea>

      {hasPosts && (
        <div className="px-6 sm:px-12 py-8 flex flex-col gap-10">
          {blogPosts.map((post) => (
            <EditableItem key={post.id} slug="blog-posts" id={post.id} title={post.title}>
              <BlogPostCard post={post} author={profile.name} avatar={profile.avatar?.url ?? null} />
            </EditableItem>
          ))}
        </div>
      )}
    </section>
  );
}
