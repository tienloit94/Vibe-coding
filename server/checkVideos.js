import mongoose from "mongoose";
import Post from "./models/Post.js";
import "./config/database.js";

async function checkVideos() {
  try {
    const videoPosts = await Post.find({
      video: { $exists: true, $ne: null },
    })
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`\nFound ${videoPosts.length} video posts:\n`);

    videoPosts.forEach((post, i) => {
      console.log(`${i + 1}. ID: ${post._id}`);
      console.log(`   Author: ${post.author?.name || "Unknown"}`);
      console.log(`   Video: ${post.video}`);
      console.log(`   Created: ${post.createdAt}`);
      console.log("");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkVideos();
