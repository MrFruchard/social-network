// app/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';
import {ThemeToggle} from "@/components/common/ThemeToggle";

export default function LoginPage() {
    return (
        <div>
            <LoginForm />
                <ThemeToggle />
            </div>
    );
}