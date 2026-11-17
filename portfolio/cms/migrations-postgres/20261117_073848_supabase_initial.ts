import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Payload's tables live in their own schema in the Supabase database. It is not
  // exposed through Supabase's Data API (only "public" is), so the anon key used
  // by the Solvimere site can't read or write it; only Payload's server connection can.
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "payload";`)
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON SCHEMA "payload" FROM anon, authenticated;
      END IF;
    END $$;`)
  await db.execute(sql`
   CREATE TYPE "payload"."enum_profiles_links_platform" AS ENUM('upwork', 'github', 'linkedin', 'whatsapp', 'fiverr', 'x', 'facebook', 'instagram', 'youtube', 'telegram', 'medium', 'stackoverflow', 'devto', 'website', 'other');
  CREATE TYPE "payload"."enum_profiles_links_icon" AS ENUM('FaAws', 'FaGithub', 'FaGitlab', 'FaLinkedin', 'FaIdCard', 'FaWhatsapp', 'FaTwitter', 'FaFacebook', 'FaInstagram', 'FaYoutube', 'FaTelegram', 'FaDiscord', 'FaMedium', 'FaStackOverflow', 'FaDev', 'FaEnvelope', 'FaPhone', 'FaGlobe', 'FaLink', 'FaCode', 'FaServer', 'FaDatabase', 'FaCloud', 'FaMobileAlt', 'FaPaintBrush', 'FaChartLine', 'FaLightbulb', 'FaRocket', 'FaUsers', 'FaAward', 'FaBriefcase', 'FaGraduationCap', 'FaHeart', 'FaCoffee', 'FaStar', 'FaCheckCircle', 'FaRegClock', 'FaShieldAlt', 'FaCogs', 'FaLaptopCode', 'SiUpwork', 'SiFiverr', 'SiGo', 'SiPython', 'SiTypescript', 'SiJavascript', 'SiReact', 'SiNextdotjs', 'SiNodedotjs', 'SiDocker', 'SiKubernetes', 'SiTerraform', 'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiApachekafka', 'SiGooglecloud', 'SiRust', 'SiPhp', 'SiLaravel', 'SiVuedotjs', 'SiAngular', 'SiFlutter', 'SiX', 'RiRobot2Line', 'DiCodeigniter', 'GiCondorEmblem', 'MdDashboard', 'MdDesignServices', 'MdOutlineSupportAgent');
  CREATE TYPE "payload"."enum_profiles_visibility" AS ENUM('public', 'private');
  CREATE TYPE "payload"."enum_profiles_hire_link_account" AS ENUM('none', 'upwork', 'github', 'linkedin', 'whatsapp', 'fiverr', 'x', 'facebook', 'instagram', 'youtube', 'telegram', 'medium', 'stackoverflow', 'devto', 'website');
  CREATE TYPE "payload"."enum_profiles_blog_account" AS ENUM('none', 'upwork', 'github', 'linkedin', 'whatsapp', 'fiverr', 'x', 'facebook', 'instagram', 'youtube', 'telegram', 'medium', 'stackoverflow', 'devto', 'website');
  CREATE TYPE "payload"."enum_profiles_cv_settings_mode" AS ENUM('generated', 'uploaded');
  CREATE TYPE "payload"."enum_profiles_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__profiles_v_version_links_platform" AS ENUM('upwork', 'github', 'linkedin', 'whatsapp', 'fiverr', 'x', 'facebook', 'instagram', 'youtube', 'telegram', 'medium', 'stackoverflow', 'devto', 'website', 'other');
  CREATE TYPE "payload"."enum__profiles_v_version_links_icon" AS ENUM('FaAws', 'FaGithub', 'FaGitlab', 'FaLinkedin', 'FaIdCard', 'FaWhatsapp', 'FaTwitter', 'FaFacebook', 'FaInstagram', 'FaYoutube', 'FaTelegram', 'FaDiscord', 'FaMedium', 'FaStackOverflow', 'FaDev', 'FaEnvelope', 'FaPhone', 'FaGlobe', 'FaLink', 'FaCode', 'FaServer', 'FaDatabase', 'FaCloud', 'FaMobileAlt', 'FaPaintBrush', 'FaChartLine', 'FaLightbulb', 'FaRocket', 'FaUsers', 'FaAward', 'FaBriefcase', 'FaGraduationCap', 'FaHeart', 'FaCoffee', 'FaStar', 'FaCheckCircle', 'FaRegClock', 'FaShieldAlt', 'FaCogs', 'FaLaptopCode', 'SiUpwork', 'SiFiverr', 'SiGo', 'SiPython', 'SiTypescript', 'SiJavascript', 'SiReact', 'SiNextdotjs', 'SiNodedotjs', 'SiDocker', 'SiKubernetes', 'SiTerraform', 'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiApachekafka', 'SiGooglecloud', 'SiRust', 'SiPhp', 'SiLaravel', 'SiVuedotjs', 'SiAngular', 'SiFlutter', 'SiX', 'RiRobot2Line', 'DiCodeigniter', 'GiCondorEmblem', 'MdDashboard', 'MdDesignServices', 'MdOutlineSupportAgent');
  CREATE TYPE "payload"."enum__profiles_v_version_visibility" AS ENUM('public', 'private');
  CREATE TYPE "payload"."enum__profiles_v_version_hire_link_account" AS ENUM('none', 'upwork', 'github', 'linkedin', 'whatsapp', 'fiverr', 'x', 'facebook', 'instagram', 'youtube', 'telegram', 'medium', 'stackoverflow', 'devto', 'website');
  CREATE TYPE "payload"."enum__profiles_v_version_blog_account" AS ENUM('none', 'upwork', 'github', 'linkedin', 'whatsapp', 'fiverr', 'x', 'facebook', 'instagram', 'youtube', 'telegram', 'medium', 'stackoverflow', 'devto', 'website');
  CREATE TYPE "payload"."enum__profiles_v_version_cv_settings_mode" AS ENUM('generated', 'uploaded');
  CREATE TYPE "payload"."enum__profiles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_services_icon" AS ENUM('FaAws', 'FaGithub', 'FaGitlab', 'FaLinkedin', 'FaIdCard', 'FaWhatsapp', 'FaTwitter', 'FaFacebook', 'FaInstagram', 'FaYoutube', 'FaTelegram', 'FaDiscord', 'FaMedium', 'FaStackOverflow', 'FaDev', 'FaEnvelope', 'FaPhone', 'FaGlobe', 'FaLink', 'FaCode', 'FaServer', 'FaDatabase', 'FaCloud', 'FaMobileAlt', 'FaPaintBrush', 'FaChartLine', 'FaLightbulb', 'FaRocket', 'FaUsers', 'FaAward', 'FaBriefcase', 'FaGraduationCap', 'FaHeart', 'FaCoffee', 'FaStar', 'FaCheckCircle', 'FaRegClock', 'FaShieldAlt', 'FaCogs', 'FaLaptopCode', 'SiUpwork', 'SiFiverr', 'SiGo', 'SiPython', 'SiTypescript', 'SiJavascript', 'SiReact', 'SiNextdotjs', 'SiNodedotjs', 'SiDocker', 'SiKubernetes', 'SiTerraform', 'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiApachekafka', 'SiGooglecloud', 'SiRust', 'SiPhp', 'SiLaravel', 'SiVuedotjs', 'SiAngular', 'SiFlutter', 'SiX', 'RiRobot2Line', 'DiCodeigniter', 'GiCondorEmblem', 'MdDashboard', 'MdDesignServices', 'MdOutlineSupportAgent');
  CREATE TYPE "payload"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__services_v_version_icon" AS ENUM('FaAws', 'FaGithub', 'FaGitlab', 'FaLinkedin', 'FaIdCard', 'FaWhatsapp', 'FaTwitter', 'FaFacebook', 'FaInstagram', 'FaYoutube', 'FaTelegram', 'FaDiscord', 'FaMedium', 'FaStackOverflow', 'FaDev', 'FaEnvelope', 'FaPhone', 'FaGlobe', 'FaLink', 'FaCode', 'FaServer', 'FaDatabase', 'FaCloud', 'FaMobileAlt', 'FaPaintBrush', 'FaChartLine', 'FaLightbulb', 'FaRocket', 'FaUsers', 'FaAward', 'FaBriefcase', 'FaGraduationCap', 'FaHeart', 'FaCoffee', 'FaStar', 'FaCheckCircle', 'FaRegClock', 'FaShieldAlt', 'FaCogs', 'FaLaptopCode', 'SiUpwork', 'SiFiverr', 'SiGo', 'SiPython', 'SiTypescript', 'SiJavascript', 'SiReact', 'SiNextdotjs', 'SiNodedotjs', 'SiDocker', 'SiKubernetes', 'SiTerraform', 'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiApachekafka', 'SiGooglecloud', 'SiRust', 'SiPhp', 'SiLaravel', 'SiVuedotjs', 'SiAngular', 'SiFlutter', 'SiX', 'RiRobot2Line', 'DiCodeigniter', 'GiCondorEmblem', 'MdDashboard', 'MdDesignServices', 'MdOutlineSupportAgent');
  CREATE TYPE "payload"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_pricing_plans_icon" AS ENUM('FaAws', 'FaGithub', 'FaGitlab', 'FaLinkedin', 'FaIdCard', 'FaWhatsapp', 'FaTwitter', 'FaFacebook', 'FaInstagram', 'FaYoutube', 'FaTelegram', 'FaDiscord', 'FaMedium', 'FaStackOverflow', 'FaDev', 'FaEnvelope', 'FaPhone', 'FaGlobe', 'FaLink', 'FaCode', 'FaServer', 'FaDatabase', 'FaCloud', 'FaMobileAlt', 'FaPaintBrush', 'FaChartLine', 'FaLightbulb', 'FaRocket', 'FaUsers', 'FaAward', 'FaBriefcase', 'FaGraduationCap', 'FaHeart', 'FaCoffee', 'FaStar', 'FaCheckCircle', 'FaRegClock', 'FaShieldAlt', 'FaCogs', 'FaLaptopCode', 'SiUpwork', 'SiFiverr', 'SiGo', 'SiPython', 'SiTypescript', 'SiJavascript', 'SiReact', 'SiNextdotjs', 'SiNodedotjs', 'SiDocker', 'SiKubernetes', 'SiTerraform', 'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiApachekafka', 'SiGooglecloud', 'SiRust', 'SiPhp', 'SiLaravel', 'SiVuedotjs', 'SiAngular', 'SiFlutter', 'SiX', 'RiRobot2Line', 'DiCodeigniter', 'GiCondorEmblem', 'MdDashboard', 'MdDesignServices', 'MdOutlineSupportAgent');
  CREATE TYPE "payload"."enum_pricing_plans_order_link_account" AS ENUM('upwork', 'github', 'linkedin', 'whatsapp', 'fiverr', 'x', 'facebook', 'instagram', 'youtube', 'telegram', 'medium', 'stackoverflow', 'devto', 'website', 'custom');
  CREATE TYPE "payload"."enum_pricing_plans_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__pricing_plans_v_version_icon" AS ENUM('FaAws', 'FaGithub', 'FaGitlab', 'FaLinkedin', 'FaIdCard', 'FaWhatsapp', 'FaTwitter', 'FaFacebook', 'FaInstagram', 'FaYoutube', 'FaTelegram', 'FaDiscord', 'FaMedium', 'FaStackOverflow', 'FaDev', 'FaEnvelope', 'FaPhone', 'FaGlobe', 'FaLink', 'FaCode', 'FaServer', 'FaDatabase', 'FaCloud', 'FaMobileAlt', 'FaPaintBrush', 'FaChartLine', 'FaLightbulb', 'FaRocket', 'FaUsers', 'FaAward', 'FaBriefcase', 'FaGraduationCap', 'FaHeart', 'FaCoffee', 'FaStar', 'FaCheckCircle', 'FaRegClock', 'FaShieldAlt', 'FaCogs', 'FaLaptopCode', 'SiUpwork', 'SiFiverr', 'SiGo', 'SiPython', 'SiTypescript', 'SiJavascript', 'SiReact', 'SiNextdotjs', 'SiNodedotjs', 'SiDocker', 'SiKubernetes', 'SiTerraform', 'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiApachekafka', 'SiGooglecloud', 'SiRust', 'SiPhp', 'SiLaravel', 'SiVuedotjs', 'SiAngular', 'SiFlutter', 'SiX', 'RiRobot2Line', 'DiCodeigniter', 'GiCondorEmblem', 'MdDashboard', 'MdDesignServices', 'MdOutlineSupportAgent');
  CREATE TYPE "payload"."enum__pricing_plans_v_version_order_link_account" AS ENUM('upwork', 'github', 'linkedin', 'whatsapp', 'fiverr', 'x', 'facebook', 'instagram', 'youtube', 'telegram', 'medium', 'stackoverflow', 'devto', 'website', 'custom');
  CREATE TYPE "payload"."enum__pricing_plans_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_clients_icon" AS ENUM('FaAws', 'FaGithub', 'FaGitlab', 'FaLinkedin', 'FaIdCard', 'FaWhatsapp', 'FaTwitter', 'FaFacebook', 'FaInstagram', 'FaYoutube', 'FaTelegram', 'FaDiscord', 'FaMedium', 'FaStackOverflow', 'FaDev', 'FaEnvelope', 'FaPhone', 'FaGlobe', 'FaLink', 'FaCode', 'FaServer', 'FaDatabase', 'FaCloud', 'FaMobileAlt', 'FaPaintBrush', 'FaChartLine', 'FaLightbulb', 'FaRocket', 'FaUsers', 'FaAward', 'FaBriefcase', 'FaGraduationCap', 'FaHeart', 'FaCoffee', 'FaStar', 'FaCheckCircle', 'FaRegClock', 'FaShieldAlt', 'FaCogs', 'FaLaptopCode', 'SiUpwork', 'SiFiverr', 'SiGo', 'SiPython', 'SiTypescript', 'SiJavascript', 'SiReact', 'SiNextdotjs', 'SiNodedotjs', 'SiDocker', 'SiKubernetes', 'SiTerraform', 'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiApachekafka', 'SiGooglecloud', 'SiRust', 'SiPhp', 'SiLaravel', 'SiVuedotjs', 'SiAngular', 'SiFlutter', 'SiX', 'RiRobot2Line', 'DiCodeigniter', 'GiCondorEmblem', 'MdDashboard', 'MdDesignServices', 'MdOutlineSupportAgent');
  CREATE TYPE "payload"."enum_clients_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__clients_v_version_icon" AS ENUM('FaAws', 'FaGithub', 'FaGitlab', 'FaLinkedin', 'FaIdCard', 'FaWhatsapp', 'FaTwitter', 'FaFacebook', 'FaInstagram', 'FaYoutube', 'FaTelegram', 'FaDiscord', 'FaMedium', 'FaStackOverflow', 'FaDev', 'FaEnvelope', 'FaPhone', 'FaGlobe', 'FaLink', 'FaCode', 'FaServer', 'FaDatabase', 'FaCloud', 'FaMobileAlt', 'FaPaintBrush', 'FaChartLine', 'FaLightbulb', 'FaRocket', 'FaUsers', 'FaAward', 'FaBriefcase', 'FaGraduationCap', 'FaHeart', 'FaCoffee', 'FaStar', 'FaCheckCircle', 'FaRegClock', 'FaShieldAlt', 'FaCogs', 'FaLaptopCode', 'SiUpwork', 'SiFiverr', 'SiGo', 'SiPython', 'SiTypescript', 'SiJavascript', 'SiReact', 'SiNextdotjs', 'SiNodedotjs', 'SiDocker', 'SiKubernetes', 'SiTerraform', 'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiApachekafka', 'SiGooglecloud', 'SiRust', 'SiPhp', 'SiLaravel', 'SiVuedotjs', 'SiAngular', 'SiFlutter', 'SiX', 'RiRobot2Line', 'DiCodeigniter', 'GiCondorEmblem', 'MdDashboard', 'MdDesignServices', 'MdOutlineSupportAgent');
  CREATE TYPE "payload"."enum__clients_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_facts_icon" AS ENUM('FaAws', 'FaGithub', 'FaGitlab', 'FaLinkedin', 'FaIdCard', 'FaWhatsapp', 'FaTwitter', 'FaFacebook', 'FaInstagram', 'FaYoutube', 'FaTelegram', 'FaDiscord', 'FaMedium', 'FaStackOverflow', 'FaDev', 'FaEnvelope', 'FaPhone', 'FaGlobe', 'FaLink', 'FaCode', 'FaServer', 'FaDatabase', 'FaCloud', 'FaMobileAlt', 'FaPaintBrush', 'FaChartLine', 'FaLightbulb', 'FaRocket', 'FaUsers', 'FaAward', 'FaBriefcase', 'FaGraduationCap', 'FaHeart', 'FaCoffee', 'FaStar', 'FaCheckCircle', 'FaRegClock', 'FaShieldAlt', 'FaCogs', 'FaLaptopCode', 'SiUpwork', 'SiFiverr', 'SiGo', 'SiPython', 'SiTypescript', 'SiJavascript', 'SiReact', 'SiNextdotjs', 'SiNodedotjs', 'SiDocker', 'SiKubernetes', 'SiTerraform', 'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiApachekafka', 'SiGooglecloud', 'SiRust', 'SiPhp', 'SiLaravel', 'SiVuedotjs', 'SiAngular', 'SiFlutter', 'SiX', 'RiRobot2Line', 'DiCodeigniter', 'GiCondorEmblem', 'MdDashboard', 'MdDesignServices', 'MdOutlineSupportAgent');
  CREATE TYPE "payload"."enum_facts_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__facts_v_version_icon" AS ENUM('FaAws', 'FaGithub', 'FaGitlab', 'FaLinkedin', 'FaIdCard', 'FaWhatsapp', 'FaTwitter', 'FaFacebook', 'FaInstagram', 'FaYoutube', 'FaTelegram', 'FaDiscord', 'FaMedium', 'FaStackOverflow', 'FaDev', 'FaEnvelope', 'FaPhone', 'FaGlobe', 'FaLink', 'FaCode', 'FaServer', 'FaDatabase', 'FaCloud', 'FaMobileAlt', 'FaPaintBrush', 'FaChartLine', 'FaLightbulb', 'FaRocket', 'FaUsers', 'FaAward', 'FaBriefcase', 'FaGraduationCap', 'FaHeart', 'FaCoffee', 'FaStar', 'FaCheckCircle', 'FaRegClock', 'FaShieldAlt', 'FaCogs', 'FaLaptopCode', 'SiUpwork', 'SiFiverr', 'SiGo', 'SiPython', 'SiTypescript', 'SiJavascript', 'SiReact', 'SiNextdotjs', 'SiNodedotjs', 'SiDocker', 'SiKubernetes', 'SiTerraform', 'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiApachekafka', 'SiGooglecloud', 'SiRust', 'SiPhp', 'SiLaravel', 'SiVuedotjs', 'SiAngular', 'SiFlutter', 'SiX', 'RiRobot2Line', 'DiCodeigniter', 'GiCondorEmblem', 'MdDashboard', 'MdDesignServices', 'MdOutlineSupportAgent');
  CREATE TYPE "payload"."enum__facts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_statistics_link_account" AS ENUM('none', 'upwork', 'github', 'linkedin', 'whatsapp', 'fiverr', 'x', 'facebook', 'instagram', 'youtube', 'telegram', 'medium', 'stackoverflow', 'devto', 'website', 'custom');
  CREATE TYPE "payload"."enum_statistics_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__statistics_v_version_link_account" AS ENUM('none', 'upwork', 'github', 'linkedin', 'whatsapp', 'fiverr', 'x', 'facebook', 'instagram', 'youtube', 'telegram', 'medium', 'stackoverflow', 'devto', 'website', 'custom');
  CREATE TYPE "payload"."enum__statistics_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_blog_posts_platform" AS ENUM('upwork', 'github', 'linkedin', 'other');
  CREATE TYPE "payload"."enum_blog_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__blog_posts_v_version_platform" AS ENUM('upwork', 'github', 'linkedin', 'other');
  CREATE TYPE "payload"."enum__blog_posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_resume_entries_type" AS ENUM('experience', 'education');
  CREATE TYPE "payload"."enum_resume_entries_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__resume_entries_v_version_type" AS ENUM('experience', 'education');
  CREATE TYPE "payload"."enum__resume_entries_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_works_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__works_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_work_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__work_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_users_role" AS ENUM('admin', 'user');
  CREATE TYPE "payload"."enum_site_settings_sections_key" AS ENUM('about', 'resume', 'works', 'blog', 'stats', 'contact', 'guestbook');
  CREATE TYPE "payload"."enum_site_settings_theme_font" AS ENUM('poppins', 'rubik', 'geist', 'inter');
  CREATE TYPE "payload"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__site_settings_v_version_sections_key" AS ENUM('about', 'resume', 'works', 'blog', 'stats', 'contact', 'guestbook');
  CREATE TYPE "payload"."enum__site_settings_v_version_theme_font" AS ENUM('poppins', 'rubik', 'geist', 'inter');
  CREATE TYPE "payload"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "payload"."contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"handled" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."guestbook_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"comment" varchar NOT NULL,
  	"approved" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."profiles_typing_titles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "payload"."profiles_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "payload"."enum_profiles_links_platform" DEFAULT 'website',
  	"url" varchar,
  	"label" varchar,
  	"info" varchar,
  	"show_in_icons" boolean DEFAULT true,
  	"icon" "payload"."enum_profiles_links_icon",
  	"color" varchar
  );
  
  CREATE TABLE "payload"."profiles_coding" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"percent" numeric
  );
  
  CREATE TABLE "payload"."profiles_knowledge" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "payload"."profiles_development" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"percent" numeric
  );
  
  CREATE TABLE "payload"."profiles_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"level" numeric
  );
  
  CREATE TABLE "payload"."profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"internal_name" varchar,
  	"slug" varchar,
  	"visibility" "payload"."enum_profiles_visibility" DEFAULT 'public',
  	"name" varchar,
  	"job_title" varchar,
  	"avatar_id" integer,
  	"cv_id" integer,
  	"hire_link_account" "payload"."enum_profiles_hire_link_account",
  	"hire_link_label" varchar DEFAULT 'my upwork',
  	"copyright" varchar,
  	"bio" varchar,
  	"age" varchar,
  	"residence" varchar,
  	"status" varchar,
  	"hourly_rate" numeric,
  	"address" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"map_embed_url" varchar,
  	"quote_text" varchar,
  	"quote_author" varchar,
  	"quote_role" varchar,
  	"quote_image_id" integer,
  	"blog_intro" varchar,
  	"blog_account" "payload"."enum_profiles_blog_account",
  	"blog_button_label" varchar DEFAULT 'view upwork profile',
  	"meta_description" varchar,
  	"cv_settings_mode" "payload"."enum_profiles_cv_settings_mode" DEFAULT 'generated',
  	"cv_settings_headline" varchar,
  	"cv_settings_location" varchar,
  	"cv_settings_summary" varchar,
  	"cv_settings_skills" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_profiles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."profiles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "payload"."_profiles_v_version_typing_titles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_profiles_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "payload"."enum__profiles_v_version_links_platform" DEFAULT 'website',
  	"url" varchar,
  	"label" varchar,
  	"info" varchar,
  	"show_in_icons" boolean DEFAULT true,
  	"icon" "payload"."enum__profiles_v_version_links_icon",
  	"color" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_profiles_v_version_coding" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"percent" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_profiles_v_version_knowledge" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_profiles_v_version_development" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"percent" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_profiles_v_version_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"level" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_profiles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_internal_name" varchar,
  	"version_slug" varchar,
  	"version_visibility" "payload"."enum__profiles_v_version_visibility" DEFAULT 'public',
  	"version_name" varchar,
  	"version_job_title" varchar,
  	"version_avatar_id" integer,
  	"version_cv_id" integer,
  	"version_hire_link_account" "payload"."enum__profiles_v_version_hire_link_account",
  	"version_hire_link_label" varchar DEFAULT 'my upwork',
  	"version_copyright" varchar,
  	"version_bio" varchar,
  	"version_age" varchar,
  	"version_residence" varchar,
  	"version_status" varchar,
  	"version_hourly_rate" numeric,
  	"version_address" varchar,
  	"version_email" varchar,
  	"version_phone" varchar,
  	"version_map_embed_url" varchar,
  	"version_quote_text" varchar,
  	"version_quote_author" varchar,
  	"version_quote_role" varchar,
  	"version_quote_image_id" integer,
  	"version_blog_intro" varchar,
  	"version_blog_account" "payload"."enum__profiles_v_version_blog_account",
  	"version_blog_button_label" varchar DEFAULT 'view upwork profile',
  	"version_meta_description" varchar,
  	"version_cv_settings_mode" "payload"."enum__profiles_v_version_cv_settings_mode" DEFAULT 'generated',
  	"version_cv_settings_headline" varchar,
  	"version_cv_settings_location" varchar,
  	"version_cv_settings_summary" varchar,
  	"version_cv_settings_skills" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__profiles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_profiles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "payload"."services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar,
  	"icon" "payload"."enum_services_icon",
  	"description" varchar,
  	"profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_title" varchar,
  	"version_icon" "payload"."enum__services_v_version_icon",
  	"version_description" varchar,
  	"version_profile_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"included" boolean DEFAULT true
  );
  
  CREATE TABLE "payload"."pricing_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar,
  	"icon" "payload"."enum_pricing_plans_icon" DEFAULT 'DiCodeigniter',
  	"price" numeric,
  	"period" varchar DEFAULT 'hour',
  	"order_link_account" "payload"."enum_pricing_plans_order_link_account",
  	"order_link_custom_url" varchar,
  	"profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_pricing_plans_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_pricing_plans_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"included" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_pricing_plans_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_name" varchar,
  	"version_icon" "payload"."enum__pricing_plans_v_version_icon" DEFAULT 'DiCodeigniter',
  	"version_price" numeric,
  	"version_period" varchar DEFAULT 'hour',
  	"version_order_link_account" "payload"."enum__pricing_plans_v_version_order_link_account",
  	"version_order_link_custom_url" varchar,
  	"version_profile_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__pricing_plans_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar,
  	"url" varchar,
  	"icon" "payload"."enum_clients_icon",
  	"logo_id" integer,
  	"profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_clients_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_clients_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_name" varchar,
  	"version_url" varchar,
  	"version_icon" "payload"."enum__clients_v_version_icon",
  	"version_logo_id" integer,
  	"version_profile_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__clients_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer,
  	"profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_quote" varchar,
  	"version_name" varchar,
  	"version_role" varchar,
  	"version_photo_id" integer,
  	"version_profile_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."facts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"icon" "payload"."enum_facts_icon",
  	"description" varchar,
  	"profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_facts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_facts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_icon" "payload"."enum__facts_v_version_icon",
  	"version_description" varchar,
  	"version_profile_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__facts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."statistics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar,
  	"value" varchar,
  	"link_account" "payload"."enum_statistics_link_account",
  	"link_custom_url" varchar,
  	"profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_statistics_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_statistics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_title" varchar,
  	"version_value" varchar,
  	"version_link_account" "payload"."enum__statistics_v_version_link_account",
  	"version_link_custom_url" varchar,
  	"version_profile_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__statistics_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."blog_posts_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "payload"."blog_posts_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "payload"."blog_posts_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "payload"."blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"platform" "payload"."enum_blog_posts_platform" DEFAULT 'other',
  	"title" varchar,
  	"headline" varchar,
  	"github_username" varchar,
  	"image_id" integer,
  	"image_caption" varchar,
  	"body" varchar,
  	"button_label" varchar,
  	"profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_blog_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_blog_posts_v_version_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_blog_posts_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_blog_posts_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_blog_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_platform" "payload"."enum__blog_posts_v_version_platform" DEFAULT 'other',
  	"version_title" varchar,
  	"version_headline" varchar,
  	"version_github_username" varchar,
  	"version_image_id" integer,
  	"version_image_caption" varchar,
  	"version_body" varchar,
  	"version_button_label" varchar,
  	"version_profile_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__blog_posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."resume_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"type" "payload"."enum_resume_entries_type" DEFAULT 'experience',
  	"period" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"location" varchar,
  	"description" varchar,
  	"profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_resume_entries_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_resume_entries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_type" "payload"."enum__resume_entries_v_version_type" DEFAULT 'experience',
  	"version_period" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_location" varchar,
  	"version_description" varchar,
  	"version_profile_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__resume_entries_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."works_tech_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "payload"."works_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "payload"."works" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar,
  	"description" varchar,
  	"client" varchar,
  	"owner" varchar,
  	"date" timestamp(3) with time zone,
  	"project_url" varchar,
  	"github_url" varchar,
  	"profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_works_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."works_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"work_categories_id" integer
  );
  
  CREATE TABLE "payload"."_works_v_version_tech_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_works_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_works_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_client" varchar,
  	"version_owner" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_project_url" varchar,
  	"version_github_url" varchar,
  	"version_profile_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__works_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_works_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"work_categories_id" integer
  );
  
  CREATE TABLE "payload"."work_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar,
  	"profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_work_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_work_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_name" varchar,
  	"version_profile_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__work_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "payload"."enum_users_role" DEFAULT 'user' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"contact_messages_id" integer,
  	"guestbook_entries_id" integer,
  	"profiles_id" integer,
  	"services_id" integer,
  	"pricing_plans_id" integer,
  	"clients_id" integer,
  	"testimonials_id" integer,
  	"facts_id" integer,
  	"statistics_id" integer,
  	"blog_posts_id" integer,
  	"resume_entries_id" integer,
  	"works_id" integer,
  	"work_categories_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."site_settings_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "payload"."enum_site_settings_sections_key",
  	"label" varchar,
  	"visible" boolean DEFAULT true
  );
  
  CREATE TABLE "payload"."site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"active_profile_id" integer,
  	"theme_accent" varchar DEFAULT '#f59e0b',
  	"theme_font" "payload"."enum_site_settings_theme_font" DEFAULT 'poppins',
  	"maintenance_enabled" boolean DEFAULT false,
  	"maintenance_message" varchar DEFAULT 'The site is being updated. Please check back soon.',
  	"_status" "payload"."enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."_site_settings_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" "payload"."enum__site_settings_v_version_sections_key",
  	"label" varchar,
  	"visible" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_active_profile_id" integer,
  	"version_theme_accent" varchar DEFAULT '#f59e0b',
  	"version_theme_font" "payload"."enum__site_settings_v_version_theme_font" DEFAULT 'poppins',
  	"version_maintenance_enabled" boolean DEFAULT false,
  	"version_maintenance_message" varchar DEFAULT 'The site is being updated. Please check back soon.',
  	"version__status" "payload"."enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload"."profiles_typing_titles" ADD CONSTRAINT "profiles_typing_titles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."profiles_links" ADD CONSTRAINT "profiles_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."profiles_coding" ADD CONSTRAINT "profiles_coding_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."profiles_knowledge" ADD CONSTRAINT "profiles_knowledge_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."profiles_development" ADD CONSTRAINT "profiles_development_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."profiles_languages" ADD CONSTRAINT "profiles_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."profiles" ADD CONSTRAINT "profiles_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."profiles" ADD CONSTRAINT "profiles_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."profiles" ADD CONSTRAINT "profiles_quote_image_id_media_id_fk" FOREIGN KEY ("quote_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."profiles_rels" ADD CONSTRAINT "profiles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."profiles_rels" ADD CONSTRAINT "profiles_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v_version_typing_titles" ADD CONSTRAINT "_profiles_v_version_typing_titles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v_version_links" ADD CONSTRAINT "_profiles_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v_version_coding" ADD CONSTRAINT "_profiles_v_version_coding_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v_version_knowledge" ADD CONSTRAINT "_profiles_v_version_knowledge_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v_version_development" ADD CONSTRAINT "_profiles_v_version_development_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v_version_languages" ADD CONSTRAINT "_profiles_v_version_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v" ADD CONSTRAINT "_profiles_v_parent_id_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v" ADD CONSTRAINT "_profiles_v_version_avatar_id_media_id_fk" FOREIGN KEY ("version_avatar_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v" ADD CONSTRAINT "_profiles_v_version_cv_id_media_id_fk" FOREIGN KEY ("version_cv_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v" ADD CONSTRAINT "_profiles_v_version_quote_image_id_media_id_fk" FOREIGN KEY ("version_quote_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v_rels" ADD CONSTRAINT "_profiles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_profiles_v_rels" ADD CONSTRAINT "_profiles_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."services" ADD CONSTRAINT "services_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_services_v" ADD CONSTRAINT "_services_v_version_profile_id_profiles_id_fk" FOREIGN KEY ("version_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pricing_plans_features" ADD CONSTRAINT "pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pricing_plans" ADD CONSTRAINT "pricing_plans_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pricing_plans_v_version_features" ADD CONSTRAINT "_pricing_plans_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pricing_plans_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pricing_plans_v" ADD CONSTRAINT "_pricing_plans_v_parent_id_pricing_plans_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."pricing_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pricing_plans_v" ADD CONSTRAINT "_pricing_plans_v_version_profile_id_profiles_id_fk" FOREIGN KEY ("version_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."clients" ADD CONSTRAINT "clients_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."clients" ADD CONSTRAINT "clients_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_clients_v" ADD CONSTRAINT "_clients_v_parent_id_clients_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_clients_v" ADD CONSTRAINT "_clients_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_clients_v" ADD CONSTRAINT "_clients_v_version_profile_id_profiles_id_fk" FOREIGN KEY ("version_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."testimonials" ADD CONSTRAINT "testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."testimonials" ADD CONSTRAINT "testimonials_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_profile_id_profiles_id_fk" FOREIGN KEY ("version_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."facts" ADD CONSTRAINT "facts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_facts_v" ADD CONSTRAINT "_facts_v_parent_id_facts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."facts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_facts_v" ADD CONSTRAINT "_facts_v_version_profile_id_profiles_id_fk" FOREIGN KEY ("version_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."statistics" ADD CONSTRAINT "statistics_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_statistics_v" ADD CONSTRAINT "_statistics_v_parent_id_statistics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."statistics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_statistics_v" ADD CONSTRAINT "_statistics_v_version_profile_id_profiles_id_fk" FOREIGN KEY ("version_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."blog_posts_badges" ADD CONSTRAINT "blog_posts_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."blog_posts_stats" ADD CONSTRAINT "blog_posts_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."blog_posts_tags" ADD CONSTRAINT "blog_posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."blog_posts" ADD CONSTRAINT "blog_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."blog_posts" ADD CONSTRAINT "blog_posts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_blog_posts_v_version_badges" ADD CONSTRAINT "_blog_posts_v_version_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_blog_posts_v_version_stats" ADD CONSTRAINT "_blog_posts_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_blog_posts_v_version_tags" ADD CONSTRAINT "_blog_posts_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_parent_id_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."blog_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_version_profile_id_profiles_id_fk" FOREIGN KEY ("version_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."resume_entries" ADD CONSTRAINT "resume_entries_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_resume_entries_v" ADD CONSTRAINT "_resume_entries_v_parent_id_resume_entries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."resume_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_resume_entries_v" ADD CONSTRAINT "_resume_entries_v_version_profile_id_profiles_id_fk" FOREIGN KEY ("version_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."works_tech_stack" ADD CONSTRAINT "works_tech_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."works_highlights" ADD CONSTRAINT "works_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."works" ADD CONSTRAINT "works_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."works_rels" ADD CONSTRAINT "works_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."works_rels" ADD CONSTRAINT "works_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."works_rels" ADD CONSTRAINT "works_rels_work_categories_fk" FOREIGN KEY ("work_categories_id") REFERENCES "payload"."work_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_works_v_version_tech_stack" ADD CONSTRAINT "_works_v_version_tech_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_works_v_version_highlights" ADD CONSTRAINT "_works_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_works_v" ADD CONSTRAINT "_works_v_parent_id_works_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_works_v" ADD CONSTRAINT "_works_v_version_profile_id_profiles_id_fk" FOREIGN KEY ("version_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_works_v_rels" ADD CONSTRAINT "_works_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_works_v_rels" ADD CONSTRAINT "_works_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_works_v_rels" ADD CONSTRAINT "_works_v_rels_work_categories_fk" FOREIGN KEY ("work_categories_id") REFERENCES "payload"."work_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."work_categories" ADD CONSTRAINT "work_categories_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_work_categories_v" ADD CONSTRAINT "_work_categories_v_parent_id_work_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."work_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_work_categories_v" ADD CONSTRAINT "_work_categories_v_version_profile_id_profiles_id_fk" FOREIGN KEY ("version_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "payload"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guestbook_entries_fk" FOREIGN KEY ("guestbook_entries_id") REFERENCES "payload"."guestbook_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_profiles_fk" FOREIGN KEY ("profiles_id") REFERENCES "payload"."profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "payload"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pricing_plans_fk" FOREIGN KEY ("pricing_plans_id") REFERENCES "payload"."pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "payload"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "payload"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_facts_fk" FOREIGN KEY ("facts_id") REFERENCES "payload"."facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_statistics_fk" FOREIGN KEY ("statistics_id") REFERENCES "payload"."statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "payload"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resume_entries_fk" FOREIGN KEY ("resume_entries_id") REFERENCES "payload"."resume_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_works_fk" FOREIGN KEY ("works_id") REFERENCES "payload"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_work_categories_fk" FOREIGN KEY ("work_categories_id") REFERENCES "payload"."work_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."site_settings_sections" ADD CONSTRAINT "site_settings_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."site_settings" ADD CONSTRAINT "site_settings_active_profile_id_profiles_id_fk" FOREIGN KEY ("active_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_site_settings_v_version_sections" ADD CONSTRAINT "_site_settings_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_active_profile_id_profiles_id_fk" FOREIGN KEY ("version_active_profile_id") REFERENCES "payload"."profiles"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "contact_messages_updated_at_idx" ON "payload"."contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "payload"."contact_messages" USING btree ("created_at");
  CREATE INDEX "guestbook_entries_updated_at_idx" ON "payload"."guestbook_entries" USING btree ("updated_at");
  CREATE INDEX "guestbook_entries_created_at_idx" ON "payload"."guestbook_entries" USING btree ("created_at");
  CREATE INDEX "profiles_typing_titles_order_idx" ON "payload"."profiles_typing_titles" USING btree ("_order");
  CREATE INDEX "profiles_typing_titles_parent_id_idx" ON "payload"."profiles_typing_titles" USING btree ("_parent_id");
  CREATE INDEX "profiles_links_order_idx" ON "payload"."profiles_links" USING btree ("_order");
  CREATE INDEX "profiles_links_parent_id_idx" ON "payload"."profiles_links" USING btree ("_parent_id");
  CREATE INDEX "profiles_coding_order_idx" ON "payload"."profiles_coding" USING btree ("_order");
  CREATE INDEX "profiles_coding_parent_id_idx" ON "payload"."profiles_coding" USING btree ("_parent_id");
  CREATE INDEX "profiles_knowledge_order_idx" ON "payload"."profiles_knowledge" USING btree ("_order");
  CREATE INDEX "profiles_knowledge_parent_id_idx" ON "payload"."profiles_knowledge" USING btree ("_parent_id");
  CREATE INDEX "profiles_development_order_idx" ON "payload"."profiles_development" USING btree ("_order");
  CREATE INDEX "profiles_development_parent_id_idx" ON "payload"."profiles_development" USING btree ("_parent_id");
  CREATE INDEX "profiles_languages_order_idx" ON "payload"."profiles_languages" USING btree ("_order");
  CREATE INDEX "profiles_languages_parent_id_idx" ON "payload"."profiles_languages" USING btree ("_parent_id");
  CREATE INDEX "profiles__order_idx" ON "payload"."profiles" USING btree ("_order");
  CREATE UNIQUE INDEX "profiles_slug_idx" ON "payload"."profiles" USING btree ("slug");
  CREATE INDEX "profiles_avatar_idx" ON "payload"."profiles" USING btree ("avatar_id");
  CREATE INDEX "profiles_cv_idx" ON "payload"."profiles" USING btree ("cv_id");
  CREATE INDEX "profiles_quote_quote_image_idx" ON "payload"."profiles" USING btree ("quote_image_id");
  CREATE INDEX "profiles_updated_at_idx" ON "payload"."profiles" USING btree ("updated_at");
  CREATE INDEX "profiles_created_at_idx" ON "payload"."profiles" USING btree ("created_at");
  CREATE INDEX "profiles__status_idx" ON "payload"."profiles" USING btree ("_status");
  CREATE INDEX "profiles_rels_order_idx" ON "payload"."profiles_rels" USING btree ("order");
  CREATE INDEX "profiles_rels_parent_idx" ON "payload"."profiles_rels" USING btree ("parent_id");
  CREATE INDEX "profiles_rels_path_idx" ON "payload"."profiles_rels" USING btree ("path");
  CREATE INDEX "profiles_rels_media_id_idx" ON "payload"."profiles_rels" USING btree ("media_id");
  CREATE INDEX "_profiles_v_version_typing_titles_order_idx" ON "payload"."_profiles_v_version_typing_titles" USING btree ("_order");
  CREATE INDEX "_profiles_v_version_typing_titles_parent_id_idx" ON "payload"."_profiles_v_version_typing_titles" USING btree ("_parent_id");
  CREATE INDEX "_profiles_v_version_links_order_idx" ON "payload"."_profiles_v_version_links" USING btree ("_order");
  CREATE INDEX "_profiles_v_version_links_parent_id_idx" ON "payload"."_profiles_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_profiles_v_version_coding_order_idx" ON "payload"."_profiles_v_version_coding" USING btree ("_order");
  CREATE INDEX "_profiles_v_version_coding_parent_id_idx" ON "payload"."_profiles_v_version_coding" USING btree ("_parent_id");
  CREATE INDEX "_profiles_v_version_knowledge_order_idx" ON "payload"."_profiles_v_version_knowledge" USING btree ("_order");
  CREATE INDEX "_profiles_v_version_knowledge_parent_id_idx" ON "payload"."_profiles_v_version_knowledge" USING btree ("_parent_id");
  CREATE INDEX "_profiles_v_version_development_order_idx" ON "payload"."_profiles_v_version_development" USING btree ("_order");
  CREATE INDEX "_profiles_v_version_development_parent_id_idx" ON "payload"."_profiles_v_version_development" USING btree ("_parent_id");
  CREATE INDEX "_profiles_v_version_languages_order_idx" ON "payload"."_profiles_v_version_languages" USING btree ("_order");
  CREATE INDEX "_profiles_v_version_languages_parent_id_idx" ON "payload"."_profiles_v_version_languages" USING btree ("_parent_id");
  CREATE INDEX "_profiles_v_parent_idx" ON "payload"."_profiles_v" USING btree ("parent_id");
  CREATE INDEX "_profiles_v_version_version__order_idx" ON "payload"."_profiles_v" USING btree ("version__order");
  CREATE INDEX "_profiles_v_version_version_slug_idx" ON "payload"."_profiles_v" USING btree ("version_slug");
  CREATE INDEX "_profiles_v_version_version_avatar_idx" ON "payload"."_profiles_v" USING btree ("version_avatar_id");
  CREATE INDEX "_profiles_v_version_version_cv_idx" ON "payload"."_profiles_v" USING btree ("version_cv_id");
  CREATE INDEX "_profiles_v_version_quote_version_quote_image_idx" ON "payload"."_profiles_v" USING btree ("version_quote_image_id");
  CREATE INDEX "_profiles_v_version_version_updated_at_idx" ON "payload"."_profiles_v" USING btree ("version_updated_at");
  CREATE INDEX "_profiles_v_version_version_created_at_idx" ON "payload"."_profiles_v" USING btree ("version_created_at");
  CREATE INDEX "_profiles_v_version_version__status_idx" ON "payload"."_profiles_v" USING btree ("version__status");
  CREATE INDEX "_profiles_v_created_at_idx" ON "payload"."_profiles_v" USING btree ("created_at");
  CREATE INDEX "_profiles_v_updated_at_idx" ON "payload"."_profiles_v" USING btree ("updated_at");
  CREATE INDEX "_profiles_v_latest_idx" ON "payload"."_profiles_v" USING btree ("latest");
  CREATE INDEX "_profiles_v_rels_order_idx" ON "payload"."_profiles_v_rels" USING btree ("order");
  CREATE INDEX "_profiles_v_rels_parent_idx" ON "payload"."_profiles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_profiles_v_rels_path_idx" ON "payload"."_profiles_v_rels" USING btree ("path");
  CREATE INDEX "_profiles_v_rels_media_id_idx" ON "payload"."_profiles_v_rels" USING btree ("media_id");
  CREATE INDEX "services__order_idx" ON "payload"."services" USING btree ("_order");
  CREATE INDEX "services_profile_idx" ON "payload"."services" USING btree ("profile_id");
  CREATE INDEX "services_updated_at_idx" ON "payload"."services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "payload"."services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "payload"."services" USING btree ("_status");
  CREATE INDEX "_services_v_parent_idx" ON "payload"."_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version__order_idx" ON "payload"."_services_v" USING btree ("version__order");
  CREATE INDEX "_services_v_version_version_profile_idx" ON "payload"."_services_v" USING btree ("version_profile_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "payload"."_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "payload"."_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "payload"."_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "payload"."_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "payload"."_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_latest_idx" ON "payload"."_services_v" USING btree ("latest");
  CREATE INDEX "pricing_plans_features_order_idx" ON "payload"."pricing_plans_features" USING btree ("_order");
  CREATE INDEX "pricing_plans_features_parent_id_idx" ON "payload"."pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "pricing_plans__order_idx" ON "payload"."pricing_plans" USING btree ("_order");
  CREATE INDEX "pricing_plans_profile_idx" ON "payload"."pricing_plans" USING btree ("profile_id");
  CREATE INDEX "pricing_plans_updated_at_idx" ON "payload"."pricing_plans" USING btree ("updated_at");
  CREATE INDEX "pricing_plans_created_at_idx" ON "payload"."pricing_plans" USING btree ("created_at");
  CREATE INDEX "pricing_plans__status_idx" ON "payload"."pricing_plans" USING btree ("_status");
  CREATE INDEX "_pricing_plans_v_version_features_order_idx" ON "payload"."_pricing_plans_v_version_features" USING btree ("_order");
  CREATE INDEX "_pricing_plans_v_version_features_parent_id_idx" ON "payload"."_pricing_plans_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_pricing_plans_v_parent_idx" ON "payload"."_pricing_plans_v" USING btree ("parent_id");
  CREATE INDEX "_pricing_plans_v_version_version__order_idx" ON "payload"."_pricing_plans_v" USING btree ("version__order");
  CREATE INDEX "_pricing_plans_v_version_version_profile_idx" ON "payload"."_pricing_plans_v" USING btree ("version_profile_id");
  CREATE INDEX "_pricing_plans_v_version_version_updated_at_idx" ON "payload"."_pricing_plans_v" USING btree ("version_updated_at");
  CREATE INDEX "_pricing_plans_v_version_version_created_at_idx" ON "payload"."_pricing_plans_v" USING btree ("version_created_at");
  CREATE INDEX "_pricing_plans_v_version_version__status_idx" ON "payload"."_pricing_plans_v" USING btree ("version__status");
  CREATE INDEX "_pricing_plans_v_created_at_idx" ON "payload"."_pricing_plans_v" USING btree ("created_at");
  CREATE INDEX "_pricing_plans_v_updated_at_idx" ON "payload"."_pricing_plans_v" USING btree ("updated_at");
  CREATE INDEX "_pricing_plans_v_latest_idx" ON "payload"."_pricing_plans_v" USING btree ("latest");
  CREATE INDEX "clients__order_idx" ON "payload"."clients" USING btree ("_order");
  CREATE INDEX "clients_logo_idx" ON "payload"."clients" USING btree ("logo_id");
  CREATE INDEX "clients_profile_idx" ON "payload"."clients" USING btree ("profile_id");
  CREATE INDEX "clients_updated_at_idx" ON "payload"."clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "payload"."clients" USING btree ("created_at");
  CREATE INDEX "clients__status_idx" ON "payload"."clients" USING btree ("_status");
  CREATE INDEX "_clients_v_parent_idx" ON "payload"."_clients_v" USING btree ("parent_id");
  CREATE INDEX "_clients_v_version_version__order_idx" ON "payload"."_clients_v" USING btree ("version__order");
  CREATE INDEX "_clients_v_version_version_logo_idx" ON "payload"."_clients_v" USING btree ("version_logo_id");
  CREATE INDEX "_clients_v_version_version_profile_idx" ON "payload"."_clients_v" USING btree ("version_profile_id");
  CREATE INDEX "_clients_v_version_version_updated_at_idx" ON "payload"."_clients_v" USING btree ("version_updated_at");
  CREATE INDEX "_clients_v_version_version_created_at_idx" ON "payload"."_clients_v" USING btree ("version_created_at");
  CREATE INDEX "_clients_v_version_version__status_idx" ON "payload"."_clients_v" USING btree ("version__status");
  CREATE INDEX "_clients_v_created_at_idx" ON "payload"."_clients_v" USING btree ("created_at");
  CREATE INDEX "_clients_v_updated_at_idx" ON "payload"."_clients_v" USING btree ("updated_at");
  CREATE INDEX "_clients_v_latest_idx" ON "payload"."_clients_v" USING btree ("latest");
  CREATE INDEX "testimonials__order_idx" ON "payload"."testimonials" USING btree ("_order");
  CREATE INDEX "testimonials_photo_idx" ON "payload"."testimonials" USING btree ("photo_id");
  CREATE INDEX "testimonials_profile_idx" ON "payload"."testimonials" USING btree ("profile_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "payload"."testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "payload"."testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "payload"."testimonials" USING btree ("_status");
  CREATE INDEX "_testimonials_v_parent_idx" ON "payload"."_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version__order_idx" ON "payload"."_testimonials_v" USING btree ("version__order");
  CREATE INDEX "_testimonials_v_version_version_photo_idx" ON "payload"."_testimonials_v" USING btree ("version_photo_id");
  CREATE INDEX "_testimonials_v_version_version_profile_idx" ON "payload"."_testimonials_v" USING btree ("version_profile_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "payload"."_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "payload"."_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "payload"."_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "payload"."_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "payload"."_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_latest_idx" ON "payload"."_testimonials_v" USING btree ("latest");
  CREATE INDEX "facts__order_idx" ON "payload"."facts" USING btree ("_order");
  CREATE INDEX "facts_profile_idx" ON "payload"."facts" USING btree ("profile_id");
  CREATE INDEX "facts_updated_at_idx" ON "payload"."facts" USING btree ("updated_at");
  CREATE INDEX "facts_created_at_idx" ON "payload"."facts" USING btree ("created_at");
  CREATE INDEX "facts__status_idx" ON "payload"."facts" USING btree ("_status");
  CREATE INDEX "_facts_v_parent_idx" ON "payload"."_facts_v" USING btree ("parent_id");
  CREATE INDEX "_facts_v_version_version__order_idx" ON "payload"."_facts_v" USING btree ("version__order");
  CREATE INDEX "_facts_v_version_version_profile_idx" ON "payload"."_facts_v" USING btree ("version_profile_id");
  CREATE INDEX "_facts_v_version_version_updated_at_idx" ON "payload"."_facts_v" USING btree ("version_updated_at");
  CREATE INDEX "_facts_v_version_version_created_at_idx" ON "payload"."_facts_v" USING btree ("version_created_at");
  CREATE INDEX "_facts_v_version_version__status_idx" ON "payload"."_facts_v" USING btree ("version__status");
  CREATE INDEX "_facts_v_created_at_idx" ON "payload"."_facts_v" USING btree ("created_at");
  CREATE INDEX "_facts_v_updated_at_idx" ON "payload"."_facts_v" USING btree ("updated_at");
  CREATE INDEX "_facts_v_latest_idx" ON "payload"."_facts_v" USING btree ("latest");
  CREATE INDEX "statistics__order_idx" ON "payload"."statistics" USING btree ("_order");
  CREATE INDEX "statistics_profile_idx" ON "payload"."statistics" USING btree ("profile_id");
  CREATE INDEX "statistics_updated_at_idx" ON "payload"."statistics" USING btree ("updated_at");
  CREATE INDEX "statistics_created_at_idx" ON "payload"."statistics" USING btree ("created_at");
  CREATE INDEX "statistics__status_idx" ON "payload"."statistics" USING btree ("_status");
  CREATE INDEX "_statistics_v_parent_idx" ON "payload"."_statistics_v" USING btree ("parent_id");
  CREATE INDEX "_statistics_v_version_version__order_idx" ON "payload"."_statistics_v" USING btree ("version__order");
  CREATE INDEX "_statistics_v_version_version_profile_idx" ON "payload"."_statistics_v" USING btree ("version_profile_id");
  CREATE INDEX "_statistics_v_version_version_updated_at_idx" ON "payload"."_statistics_v" USING btree ("version_updated_at");
  CREATE INDEX "_statistics_v_version_version_created_at_idx" ON "payload"."_statistics_v" USING btree ("version_created_at");
  CREATE INDEX "_statistics_v_version_version__status_idx" ON "payload"."_statistics_v" USING btree ("version__status");
  CREATE INDEX "_statistics_v_created_at_idx" ON "payload"."_statistics_v" USING btree ("created_at");
  CREATE INDEX "_statistics_v_updated_at_idx" ON "payload"."_statistics_v" USING btree ("updated_at");
  CREATE INDEX "_statistics_v_latest_idx" ON "payload"."_statistics_v" USING btree ("latest");
  CREATE INDEX "blog_posts_badges_order_idx" ON "payload"."blog_posts_badges" USING btree ("_order");
  CREATE INDEX "blog_posts_badges_parent_id_idx" ON "payload"."blog_posts_badges" USING btree ("_parent_id");
  CREATE INDEX "blog_posts_stats_order_idx" ON "payload"."blog_posts_stats" USING btree ("_order");
  CREATE INDEX "blog_posts_stats_parent_id_idx" ON "payload"."blog_posts_stats" USING btree ("_parent_id");
  CREATE INDEX "blog_posts_tags_order_idx" ON "payload"."blog_posts_tags" USING btree ("_order");
  CREATE INDEX "blog_posts_tags_parent_id_idx" ON "payload"."blog_posts_tags" USING btree ("_parent_id");
  CREATE INDEX "blog_posts__order_idx" ON "payload"."blog_posts" USING btree ("_order");
  CREATE INDEX "blog_posts_image_idx" ON "payload"."blog_posts" USING btree ("image_id");
  CREATE INDEX "blog_posts_profile_idx" ON "payload"."blog_posts" USING btree ("profile_id");
  CREATE INDEX "blog_posts_updated_at_idx" ON "payload"."blog_posts" USING btree ("updated_at");
  CREATE INDEX "blog_posts_created_at_idx" ON "payload"."blog_posts" USING btree ("created_at");
  CREATE INDEX "blog_posts__status_idx" ON "payload"."blog_posts" USING btree ("_status");
  CREATE INDEX "_blog_posts_v_version_badges_order_idx" ON "payload"."_blog_posts_v_version_badges" USING btree ("_order");
  CREATE INDEX "_blog_posts_v_version_badges_parent_id_idx" ON "payload"."_blog_posts_v_version_badges" USING btree ("_parent_id");
  CREATE INDEX "_blog_posts_v_version_stats_order_idx" ON "payload"."_blog_posts_v_version_stats" USING btree ("_order");
  CREATE INDEX "_blog_posts_v_version_stats_parent_id_idx" ON "payload"."_blog_posts_v_version_stats" USING btree ("_parent_id");
  CREATE INDEX "_blog_posts_v_version_tags_order_idx" ON "payload"."_blog_posts_v_version_tags" USING btree ("_order");
  CREATE INDEX "_blog_posts_v_version_tags_parent_id_idx" ON "payload"."_blog_posts_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_blog_posts_v_parent_idx" ON "payload"."_blog_posts_v" USING btree ("parent_id");
  CREATE INDEX "_blog_posts_v_version_version__order_idx" ON "payload"."_blog_posts_v" USING btree ("version__order");
  CREATE INDEX "_blog_posts_v_version_version_image_idx" ON "payload"."_blog_posts_v" USING btree ("version_image_id");
  CREATE INDEX "_blog_posts_v_version_version_profile_idx" ON "payload"."_blog_posts_v" USING btree ("version_profile_id");
  CREATE INDEX "_blog_posts_v_version_version_updated_at_idx" ON "payload"."_blog_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_blog_posts_v_version_version_created_at_idx" ON "payload"."_blog_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_blog_posts_v_version_version__status_idx" ON "payload"."_blog_posts_v" USING btree ("version__status");
  CREATE INDEX "_blog_posts_v_created_at_idx" ON "payload"."_blog_posts_v" USING btree ("created_at");
  CREATE INDEX "_blog_posts_v_updated_at_idx" ON "payload"."_blog_posts_v" USING btree ("updated_at");
  CREATE INDEX "_blog_posts_v_latest_idx" ON "payload"."_blog_posts_v" USING btree ("latest");
  CREATE INDEX "resume_entries__order_idx" ON "payload"."resume_entries" USING btree ("_order");
  CREATE INDEX "resume_entries_profile_idx" ON "payload"."resume_entries" USING btree ("profile_id");
  CREATE INDEX "resume_entries_updated_at_idx" ON "payload"."resume_entries" USING btree ("updated_at");
  CREATE INDEX "resume_entries_created_at_idx" ON "payload"."resume_entries" USING btree ("created_at");
  CREATE INDEX "resume_entries__status_idx" ON "payload"."resume_entries" USING btree ("_status");
  CREATE INDEX "_resume_entries_v_parent_idx" ON "payload"."_resume_entries_v" USING btree ("parent_id");
  CREATE INDEX "_resume_entries_v_version_version__order_idx" ON "payload"."_resume_entries_v" USING btree ("version__order");
  CREATE INDEX "_resume_entries_v_version_version_profile_idx" ON "payload"."_resume_entries_v" USING btree ("version_profile_id");
  CREATE INDEX "_resume_entries_v_version_version_updated_at_idx" ON "payload"."_resume_entries_v" USING btree ("version_updated_at");
  CREATE INDEX "_resume_entries_v_version_version_created_at_idx" ON "payload"."_resume_entries_v" USING btree ("version_created_at");
  CREATE INDEX "_resume_entries_v_version_version__status_idx" ON "payload"."_resume_entries_v" USING btree ("version__status");
  CREATE INDEX "_resume_entries_v_created_at_idx" ON "payload"."_resume_entries_v" USING btree ("created_at");
  CREATE INDEX "_resume_entries_v_updated_at_idx" ON "payload"."_resume_entries_v" USING btree ("updated_at");
  CREATE INDEX "_resume_entries_v_latest_idx" ON "payload"."_resume_entries_v" USING btree ("latest");
  CREATE INDEX "works_tech_stack_order_idx" ON "payload"."works_tech_stack" USING btree ("_order");
  CREATE INDEX "works_tech_stack_parent_id_idx" ON "payload"."works_tech_stack" USING btree ("_parent_id");
  CREATE INDEX "works_highlights_order_idx" ON "payload"."works_highlights" USING btree ("_order");
  CREATE INDEX "works_highlights_parent_id_idx" ON "payload"."works_highlights" USING btree ("_parent_id");
  CREATE INDEX "works__order_idx" ON "payload"."works" USING btree ("_order");
  CREATE INDEX "works_profile_idx" ON "payload"."works" USING btree ("profile_id");
  CREATE INDEX "works_updated_at_idx" ON "payload"."works" USING btree ("updated_at");
  CREATE INDEX "works_created_at_idx" ON "payload"."works" USING btree ("created_at");
  CREATE INDEX "works__status_idx" ON "payload"."works" USING btree ("_status");
  CREATE INDEX "works_rels_order_idx" ON "payload"."works_rels" USING btree ("order");
  CREATE INDEX "works_rels_parent_idx" ON "payload"."works_rels" USING btree ("parent_id");
  CREATE INDEX "works_rels_path_idx" ON "payload"."works_rels" USING btree ("path");
  CREATE INDEX "works_rels_media_id_idx" ON "payload"."works_rels" USING btree ("media_id");
  CREATE INDEX "works_rels_work_categories_id_idx" ON "payload"."works_rels" USING btree ("work_categories_id");
  CREATE INDEX "_works_v_version_tech_stack_order_idx" ON "payload"."_works_v_version_tech_stack" USING btree ("_order");
  CREATE INDEX "_works_v_version_tech_stack_parent_id_idx" ON "payload"."_works_v_version_tech_stack" USING btree ("_parent_id");
  CREATE INDEX "_works_v_version_highlights_order_idx" ON "payload"."_works_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_works_v_version_highlights_parent_id_idx" ON "payload"."_works_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_works_v_parent_idx" ON "payload"."_works_v" USING btree ("parent_id");
  CREATE INDEX "_works_v_version_version__order_idx" ON "payload"."_works_v" USING btree ("version__order");
  CREATE INDEX "_works_v_version_version_profile_idx" ON "payload"."_works_v" USING btree ("version_profile_id");
  CREATE INDEX "_works_v_version_version_updated_at_idx" ON "payload"."_works_v" USING btree ("version_updated_at");
  CREATE INDEX "_works_v_version_version_created_at_idx" ON "payload"."_works_v" USING btree ("version_created_at");
  CREATE INDEX "_works_v_version_version__status_idx" ON "payload"."_works_v" USING btree ("version__status");
  CREATE INDEX "_works_v_created_at_idx" ON "payload"."_works_v" USING btree ("created_at");
  CREATE INDEX "_works_v_updated_at_idx" ON "payload"."_works_v" USING btree ("updated_at");
  CREATE INDEX "_works_v_latest_idx" ON "payload"."_works_v" USING btree ("latest");
  CREATE INDEX "_works_v_rels_order_idx" ON "payload"."_works_v_rels" USING btree ("order");
  CREATE INDEX "_works_v_rels_parent_idx" ON "payload"."_works_v_rels" USING btree ("parent_id");
  CREATE INDEX "_works_v_rels_path_idx" ON "payload"."_works_v_rels" USING btree ("path");
  CREATE INDEX "_works_v_rels_media_id_idx" ON "payload"."_works_v_rels" USING btree ("media_id");
  CREATE INDEX "_works_v_rels_work_categories_id_idx" ON "payload"."_works_v_rels" USING btree ("work_categories_id");
  CREATE INDEX "work_categories__order_idx" ON "payload"."work_categories" USING btree ("_order");
  CREATE INDEX "work_categories_profile_idx" ON "payload"."work_categories" USING btree ("profile_id");
  CREATE INDEX "work_categories_updated_at_idx" ON "payload"."work_categories" USING btree ("updated_at");
  CREATE INDEX "work_categories_created_at_idx" ON "payload"."work_categories" USING btree ("created_at");
  CREATE INDEX "work_categories__status_idx" ON "payload"."work_categories" USING btree ("_status");
  CREATE INDEX "_work_categories_v_parent_idx" ON "payload"."_work_categories_v" USING btree ("parent_id");
  CREATE INDEX "_work_categories_v_version_version__order_idx" ON "payload"."_work_categories_v" USING btree ("version__order");
  CREATE INDEX "_work_categories_v_version_version_profile_idx" ON "payload"."_work_categories_v" USING btree ("version_profile_id");
  CREATE INDEX "_work_categories_v_version_version_updated_at_idx" ON "payload"."_work_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_work_categories_v_version_version_created_at_idx" ON "payload"."_work_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_work_categories_v_version_version__status_idx" ON "payload"."_work_categories_v" USING btree ("version__status");
  CREATE INDEX "_work_categories_v_created_at_idx" ON "payload"."_work_categories_v" USING btree ("created_at");
  CREATE INDEX "_work_categories_v_updated_at_idx" ON "payload"."_work_categories_v" USING btree ("updated_at");
  CREATE INDEX "_work_categories_v_latest_idx" ON "payload"."_work_categories_v" USING btree ("latest");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "payload"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "payload"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "payload"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "payload"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "payload"."users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_guestbook_entries_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("guestbook_entries_id");
  CREATE INDEX "payload_locked_documents_rels_profiles_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("profiles_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_pricing_plans_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("pricing_plans_id");
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("clients_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_facts_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("facts_id");
  CREATE INDEX "payload_locked_documents_rels_statistics_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("statistics_id");
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_locked_documents_rels_resume_entries_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("resume_entries_id");
  CREATE INDEX "payload_locked_documents_rels_works_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("works_id");
  CREATE INDEX "payload_locked_documents_rels_work_categories_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("work_categories_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_sections_order_idx" ON "payload"."site_settings_sections" USING btree ("_order");
  CREATE INDEX "site_settings_sections_parent_id_idx" ON "payload"."site_settings_sections" USING btree ("_parent_id");
  CREATE INDEX "site_settings_active_profile_idx" ON "payload"."site_settings" USING btree ("active_profile_id");
  CREATE INDEX "site_settings__status_idx" ON "payload"."site_settings" USING btree ("_status");
  CREATE INDEX "_site_settings_v_version_sections_order_idx" ON "payload"."_site_settings_v_version_sections" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_sections_parent_id_idx" ON "payload"."_site_settings_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_version_active_profile_idx" ON "payload"."_site_settings_v" USING btree ("version_active_profile_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "payload"."_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "payload"."_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "payload"."_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "payload"."_site_settings_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."contact_messages" CASCADE;
  DROP TABLE "payload"."guestbook_entries" CASCADE;
  DROP TABLE "payload"."profiles_typing_titles" CASCADE;
  DROP TABLE "payload"."profiles_links" CASCADE;
  DROP TABLE "payload"."profiles_coding" CASCADE;
  DROP TABLE "payload"."profiles_knowledge" CASCADE;
  DROP TABLE "payload"."profiles_development" CASCADE;
  DROP TABLE "payload"."profiles_languages" CASCADE;
  DROP TABLE "payload"."profiles" CASCADE;
  DROP TABLE "payload"."profiles_rels" CASCADE;
  DROP TABLE "payload"."_profiles_v_version_typing_titles" CASCADE;
  DROP TABLE "payload"."_profiles_v_version_links" CASCADE;
  DROP TABLE "payload"."_profiles_v_version_coding" CASCADE;
  DROP TABLE "payload"."_profiles_v_version_knowledge" CASCADE;
  DROP TABLE "payload"."_profiles_v_version_development" CASCADE;
  DROP TABLE "payload"."_profiles_v_version_languages" CASCADE;
  DROP TABLE "payload"."_profiles_v" CASCADE;
  DROP TABLE "payload"."_profiles_v_rels" CASCADE;
  DROP TABLE "payload"."services" CASCADE;
  DROP TABLE "payload"."_services_v" CASCADE;
  DROP TABLE "payload"."pricing_plans_features" CASCADE;
  DROP TABLE "payload"."pricing_plans" CASCADE;
  DROP TABLE "payload"."_pricing_plans_v_version_features" CASCADE;
  DROP TABLE "payload"."_pricing_plans_v" CASCADE;
  DROP TABLE "payload"."clients" CASCADE;
  DROP TABLE "payload"."_clients_v" CASCADE;
  DROP TABLE "payload"."testimonials" CASCADE;
  DROP TABLE "payload"."_testimonials_v" CASCADE;
  DROP TABLE "payload"."facts" CASCADE;
  DROP TABLE "payload"."_facts_v" CASCADE;
  DROP TABLE "payload"."statistics" CASCADE;
  DROP TABLE "payload"."_statistics_v" CASCADE;
  DROP TABLE "payload"."blog_posts_badges" CASCADE;
  DROP TABLE "payload"."blog_posts_stats" CASCADE;
  DROP TABLE "payload"."blog_posts_tags" CASCADE;
  DROP TABLE "payload"."blog_posts" CASCADE;
  DROP TABLE "payload"."_blog_posts_v_version_badges" CASCADE;
  DROP TABLE "payload"."_blog_posts_v_version_stats" CASCADE;
  DROP TABLE "payload"."_blog_posts_v_version_tags" CASCADE;
  DROP TABLE "payload"."_blog_posts_v" CASCADE;
  DROP TABLE "payload"."resume_entries" CASCADE;
  DROP TABLE "payload"."_resume_entries_v" CASCADE;
  DROP TABLE "payload"."works_tech_stack" CASCADE;
  DROP TABLE "payload"."works_highlights" CASCADE;
  DROP TABLE "payload"."works" CASCADE;
  DROP TABLE "payload"."works_rels" CASCADE;
  DROP TABLE "payload"."_works_v_version_tech_stack" CASCADE;
  DROP TABLE "payload"."_works_v_version_highlights" CASCADE;
  DROP TABLE "payload"."_works_v" CASCADE;
  DROP TABLE "payload"."_works_v_rels" CASCADE;
  DROP TABLE "payload"."work_categories" CASCADE;
  DROP TABLE "payload"."_work_categories_v" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."users_sessions" CASCADE;
  DROP TABLE "payload"."users" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TABLE "payload"."site_settings_sections" CASCADE;
  DROP TABLE "payload"."site_settings" CASCADE;
  DROP TABLE "payload"."_site_settings_v_version_sections" CASCADE;
  DROP TABLE "payload"."_site_settings_v" CASCADE;
  DROP TYPE "payload"."enum_profiles_links_platform";
  DROP TYPE "payload"."enum_profiles_links_icon";
  DROP TYPE "payload"."enum_profiles_visibility";
  DROP TYPE "payload"."enum_profiles_hire_link_account";
  DROP TYPE "payload"."enum_profiles_blog_account";
  DROP TYPE "payload"."enum_profiles_cv_settings_mode";
  DROP TYPE "payload"."enum_profiles_status";
  DROP TYPE "payload"."enum__profiles_v_version_links_platform";
  DROP TYPE "payload"."enum__profiles_v_version_links_icon";
  DROP TYPE "payload"."enum__profiles_v_version_visibility";
  DROP TYPE "payload"."enum__profiles_v_version_hire_link_account";
  DROP TYPE "payload"."enum__profiles_v_version_blog_account";
  DROP TYPE "payload"."enum__profiles_v_version_cv_settings_mode";
  DROP TYPE "payload"."enum__profiles_v_version_status";
  DROP TYPE "payload"."enum_services_icon";
  DROP TYPE "payload"."enum_services_status";
  DROP TYPE "payload"."enum__services_v_version_icon";
  DROP TYPE "payload"."enum__services_v_version_status";
  DROP TYPE "payload"."enum_pricing_plans_icon";
  DROP TYPE "payload"."enum_pricing_plans_order_link_account";
  DROP TYPE "payload"."enum_pricing_plans_status";
  DROP TYPE "payload"."enum__pricing_plans_v_version_icon";
  DROP TYPE "payload"."enum__pricing_plans_v_version_order_link_account";
  DROP TYPE "payload"."enum__pricing_plans_v_version_status";
  DROP TYPE "payload"."enum_clients_icon";
  DROP TYPE "payload"."enum_clients_status";
  DROP TYPE "payload"."enum__clients_v_version_icon";
  DROP TYPE "payload"."enum__clients_v_version_status";
  DROP TYPE "payload"."enum_testimonials_status";
  DROP TYPE "payload"."enum__testimonials_v_version_status";
  DROP TYPE "payload"."enum_facts_icon";
  DROP TYPE "payload"."enum_facts_status";
  DROP TYPE "payload"."enum__facts_v_version_icon";
  DROP TYPE "payload"."enum__facts_v_version_status";
  DROP TYPE "payload"."enum_statistics_link_account";
  DROP TYPE "payload"."enum_statistics_status";
  DROP TYPE "payload"."enum__statistics_v_version_link_account";
  DROP TYPE "payload"."enum__statistics_v_version_status";
  DROP TYPE "payload"."enum_blog_posts_platform";
  DROP TYPE "payload"."enum_blog_posts_status";
  DROP TYPE "payload"."enum__blog_posts_v_version_platform";
  DROP TYPE "payload"."enum__blog_posts_v_version_status";
  DROP TYPE "payload"."enum_resume_entries_type";
  DROP TYPE "payload"."enum_resume_entries_status";
  DROP TYPE "payload"."enum__resume_entries_v_version_type";
  DROP TYPE "payload"."enum__resume_entries_v_version_status";
  DROP TYPE "payload"."enum_works_status";
  DROP TYPE "payload"."enum__works_v_version_status";
  DROP TYPE "payload"."enum_work_categories_status";
  DROP TYPE "payload"."enum__work_categories_v_version_status";
  DROP TYPE "payload"."enum_users_role";
  DROP TYPE "payload"."enum_site_settings_sections_key";
  DROP TYPE "payload"."enum_site_settings_theme_font";
  DROP TYPE "payload"."enum_site_settings_status";
  DROP TYPE "payload"."enum__site_settings_v_version_sections_key";
  DROP TYPE "payload"."enum__site_settings_v_version_theme_font";
  DROP TYPE "payload"."enum__site_settings_v_version_status";`)
}
