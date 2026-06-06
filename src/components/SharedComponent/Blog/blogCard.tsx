import React from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

import type { Blog } from "@/types/blog";

type BlogCardProps = {
  blog: Blog;
};

const BlogCard = ({ blog }: BlogCardProps) => {
  const { title, coverImage, date, slug } = blog;

  const formattedDate = date ? format(new Date(date), "MMM dd yyyy") : "";

  return (
    <Link
      href={`/blog/${slug}`}
      className="group mb-10 flex items-center gap-9"
      aria-label={title}
    >
      <div className="overflow-hidden rounded-lg">
        <Image
          src={coverImage}
          alt={title || "Blog cover image"}
          width={300}
          height={250}
          className="duration-300 group-hover:scale-110"
        />
      </div>

      <div>
        {formattedDate && (
          <span className="mb-1 text-16 text-dark_grey">
            {formattedDate}
          </span>
        )}
        <h5 className="mb-9 text-22 font-medium group-hover:text-primary">
          {title}
        </h5>
        <p className="text-17 font-medium text-primary">Read More</p>
      </div>
    </Link>
  );
};

export default BlogCard;