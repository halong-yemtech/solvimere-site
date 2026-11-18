import { FiArrowUpRight, FiEdit3 } from "react-icons/fi";
import { useSite } from "../SiteProvider";
import BlogPostCard from "./BlogPostCard";

/** Blog: posts and highlights from the profile's accounts (Upwork, GitHub, LinkedIn…). */
export default function DevBlogs() {
  const { profile, blogPosts } = useSite();
  const { blog } = profile;
  const hasPosts = blogPosts.length > 0;

  return (
    <section>
      {blog.intro && hasPosts && (
        <p className="mb-6 max-w-[76rem] text-[1.55rem] leading-[1.7] text-gray-400">{blog.intro}</p>
      )}

      {hasPosts ? (
        <div className="flex flex-col gap-6">
          {blogPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} author={profile.name} avatar={profile.avatar?.url ?? null} />
          ))}
        </div>
      ) : (
        <div className="pf-card p-12 text-center">
          <FiEdit3 className="mx-auto mb-4 text-[3rem] text-gray-500" aria-hidden />
          <p className="mx-auto max-w-[56rem] text-[1.6rem] leading-relaxed text-gray-400">
            {blog.intro || "Posts will be shown here soon."}
          </p>
          {blog.buttonUrl && (
            <a href={blog.buttonUrl} target="_blank" rel="noreferrer" className="pf-btn pf-btn-ghost mt-8">
              {blog.buttonLabel || "Read more"}
              <span className="pf-btn-ico">
                <FiArrowUpRight aria-hidden />
              </span>
            </a>
          )}
        </div>
      )}
    </section>
  );
}
