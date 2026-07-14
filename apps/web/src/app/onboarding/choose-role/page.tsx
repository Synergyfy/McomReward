"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const roles = [
  {
    title: "Sign up as a Customer",
    description:
      "Join exciting campaigns, earn reward points, and redeem deals from your favorite businesses.",
    path: "/customer/signup",
    cta: "Continue as a Customer",
  },
  {
    title: "Sign up as a Business Owner",
    description:
      "Create loyalty campaigns, engage your customers, and track performance through powerful tools.",
    path: "/business/signup",
    cta: "Continue as a Business Owner",
  },
];

export default function ChooseRolePage() {
  const router = useRouter();

  const handleRoleSelection = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Join Our Loyalty Program
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            First, let's get you started. Are you a customer or a business
            owner?
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {roles.map((role) => (
            <div
              key={role.title}
              onClick={() => handleRoleSelection(role.path)}
              className="group relative cursor-pointer"
            >
              <Card className="h-full transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">
                    {role.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                  <Button className="mt-6 w-full">{role.cta}</Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
