import { motion } from "framer-motion";

function PageHeader({ title, subtitle, bgImage = "/assets/default.jpg" }) {
    return (
        <div className="relative h-64 w-full bg-purple-900 overflow-hidden flex items-center justify-center">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url('${bgImage}')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 text-center px-6">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg"
                >
                    {title}
                </motion.h1>
                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-purple-200 font-medium"
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>
        </div>
    );
}

export default PageHeader;
