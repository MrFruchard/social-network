import { LoginPage } from "@/app/login/page";
import {LogoutButton} from "@/components/logout-button";

export default function Home() {
  return (
    <div>
        <LoginPage />
        <LogoutButton />
    </div>
  );
}
