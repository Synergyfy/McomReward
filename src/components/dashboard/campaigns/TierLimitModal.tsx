import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from 'framer-motion';

interface TierLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

const TierLimitModal: React.FC<TierLimitModalProps> = ({ isOpen, onClose, message }) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader className="items-center">
                    <div className="mb-4">
                        <motion.svg
                            width="100"
                            height="100"
                            viewBox="0 0 100 100"
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="#EF4444"
                                strokeWidth="4"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                            />
                            <motion.circle
                                cx="35"
                                cy="40"
                                r="5"
                                fill="#EF4444"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                            />
                            <motion.circle
                                cx="65"
                                cy="40"
                                r="5"
                                fill="#EF4444"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                            />
                            <motion.path
                                d="M 30 70 Q 50 50 70 70"
                                stroke="#EF4444"
                                strokeWidth="4"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                            />
                        </motion.svg>
                    </div>
                    <AlertDialogTitle className="text-xl text-center text-red-600">Action Not Allowed</AlertDialogTitle>
                    <AlertDialogDescription className="text-center pt-2 text-gray-600">
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogAction onClick={onClose} className="bg-red-600 hover:bg-red-700">
                        I Understand
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default TierLimitModal;
