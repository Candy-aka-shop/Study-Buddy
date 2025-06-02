import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const ASSETS = {
  logo: '/logo.png',
  background: '/bg.jpg', 
};

const COLORS = {
  text: 'text-white',
  button: 'bg-blue-500 hover:bg-blue-400 focus:ring-blue-300',
  gradient: 'bg-gradient-to-r from-blue-500 via-blue-700 to-blue-300',
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      staggerChildren: 0.2,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const HomePage = () => {
  return (
    <main className="relative min-h-screen flex items-center justify-center pt-16 pb-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSETS.background})` }}
      />
      <div className={clsx('absolute inset-0 opacity-80', COLORS.gradient)} />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 md:px-8 text-center"
      >
        <motion.h1
          variants={childVariants}
          className={clsx(
            COLORS.text,
            'text-3xl sm:text-4xl md:text-5xl font-bold leading-tight',
          )}
        >
          Meet, chat, and study — together.
          <br />
          Connect with students worldwide and enjoy studying.
        </motion.h1>
        <motion.p
          variants={childVariants}
          className={clsx(COLORS.text, 'text-base sm:text-lg md:text-xl')}
        >
          Your study buddy is just a click away.
        </motion.p>
        <motion.div variants={buttonVariants}>
          <Link
            to="/register"
            className={clsx(
              COLORS.button,
              'inline-block rounded-xl px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 text-white font-semibold text-lg sm:text-xl md:text-2xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition',
            )}
          >
            Find Your Study Buddy
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default HomePage;