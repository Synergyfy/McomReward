import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8 text-center max-w-md">
                Could not find requested resource. The page you are looking for might have been removed or doesn't exist.
            </p>
            <Link href="/">
                <Button>Return Home</Button>
            </Link>
        </div>
    )
}
