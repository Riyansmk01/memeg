import { SignUp } from "@clerk/clerk-react";
import { Sprout } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Sprout className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">eSawit</h1>
          <p className="text-muted-foreground">Daftar untuk Memulai Mengelola Kebun Sawit Anda</p>
        </div>

        <div className="flex justify-center">
          <SignUp 
            routing="path" 
            path="/register" 
            signInUrl="/login" 
            afterSignUpUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
