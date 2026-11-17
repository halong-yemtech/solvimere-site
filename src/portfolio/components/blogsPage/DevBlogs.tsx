import { Fragment } from "react";

import Title from "../Title";
import { useSite } from "../SiteProvider";
import BlogPostCard from "./BlogPostCard";

export default function DevBlogs() {
  const { profile, blogPosts } = useSite();
  const { blog } = profile;
  const hasPosts = blogPosts.length > 0;

  return (
    <section className="h-full overflow-y-scroll myScroll">
      <Title name="blogs" />

      <>
        <div className={hasPosts ? "px-12 pt-10 pb-2" : "px-12 py-16 text-center"}>
          {blog.intro && (
            <p className={`text-2xl text-gray-400 leading-relaxed ${hasPosts ? "" : "max-w-3xl mx-auto"}`}>
              {blog.intro}
            </p>
          )}
          {blog.buttonUrl && !hasPosts && (
            <a
              href={blog.buttonUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-8 text-xl uppercase font-semibold text-gray-300 border-2 border-gray-300 rounded-full px-8 py-3 hover:text-main-orange hover:border-main-orange transition-all duration-200"
            >
              {blog.buttonLabel}
            </a>
          )}
        </div>
      </>

      {hasPosts && (
        <div className="px-6 sm:px-12 py-8 flex flex-col gap-10">
          {blogPosts.map((post) => (
            <Fragment key={post.id}>
              <BlogPostCard post={post} author={profile.name} avatar={profile.avatar?.url ?? null} />
            </Fragment>
          ))}
        </div>
      )}
    </section>
  );
}
