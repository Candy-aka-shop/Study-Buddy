import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.3,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const HomePage = () => {
  return (
    <div className="relative h-screen flex justify-center items-center">
      <img src="/logo.png" alt="Study Buddy Logo" className="absolute top-4 left-4 w-24 sm:w-32" />
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed saturate-200"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-700 to-blue-200 opacity-70"></div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-11/12 sm:w-5/6 w-4xl mx-auto flex flex-col gap-4 sm:gap-6 md:gap-8 text-pure-white px-4 sm:px-6 md:px-8"
      >
        <motion.h2
          variants={childVariants}
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
        >
          Meet, chat, and study — together.
          <br />
          Connect with students like you from all over the world — and finally enjoy studying.
        </motion.h2>
        <motion.p
          variants={childVariants}
          className="text-lg sm:text-xl"
        >
          Your study buddy is just a click away.
        </motion.p>
        <motion.div
          variants={buttonVariants}
        >
          <Link
            to="/register"
            className="bg-light-blue text-blue-500 rounded-xl w-full sm:w-3/4 md:w-auto min-w-[200px] text-center font-extrabold text-xl sm:text-2xl md:text-3xl hover:bg-gray-100 hover:shadow-lg transition px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 shadow shadow-gray-300"
          >
            Find Your Study Buddy
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;