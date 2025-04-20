"use client";



import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import AppModal from "@/assets/app.jpg"

const words = [
  { text: "No" },
  { text: "clutter," },
  { text: "no" },
  { text: "chaos." },
  { text: "TinuMind", className: "text-violet-500 font-bold dark:text-violet-500 text-5xl ", },
  { text: "helps" },
  { text: "you" },
  { text: "stay" },
  { text: "on" },
  { text: "top" },
  { text: "of" },
  { text: "your" },
  { text: "thoughts" },
  { text: "and" },
  { text: "to-dos," },
  { text: "without" },
  { text: "breaking" },
  { text: "your" },
  { text: "flow." },
];





export function Home() {
  return (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      <Navbar />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="px-4 py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {"Your tasks. Your notes. One smooth workspace."
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          <TypewriterEffect  words={words} /> 
          


        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
            delay: 1.5,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/login">
            <button className="w-60 transform rounded-full bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            
              Login
            </button>
          </Link>
          <div className="justify-center text-center">
            <Link to="/signup">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              duration={5}
              className="w-60 dark:bg-black bg-white text-black dark:text-white cursor-pointer "
            >
            
              <span>Sign Up</span>
            </HoverBorderGradient>
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
          className="relative z-10 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">

            <img
              // src="https://assets.aceternity.com/pro/aceternity-landing.webp"
              src={AppModal}
              alt="Landing page preview"
              className="aspect-[16/9] brightness-[0.9] h-auto w-full object-cover dark:brightness-[0.7]"
              height={1000}
              width={1000}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const Navbar = () => {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
        <h1 className="text-base font-bold md:text-2xl">Tinumind Inc.</h1>
      </div>

    </nav>
  );
};
export default Home